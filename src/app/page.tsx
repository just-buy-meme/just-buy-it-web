"use client";

import { nanoid } from "nanoid";
import { useCallback, useRef, useState, useEffect } from "react";

import { sendMessage, useStore } from "~/core/store";
import { cn } from "~/core/utils";
import { type WorkflowStep } from "~/core/workflow";

import { AppHeader } from "./_components/AppHeader";
import { InputBox } from "./_components/InputBox";
import { MessageHistoryView } from "./_components/MessageHistoryView";
import { MarketMonitoring } from "./_components/MarketMonitoring";

export default function HomePage() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const messages = useStore((state) => state.messages);
  const responding = useStore((state) => state.responding);
  const workflow = useStore((state) => 
    state.messages.find(m => m.type === "workflow")
      ? (state.messages.find(m => m.type === "workflow") as any).content.workflow
      : null
  );

  // 모니터링 패널 상태 관리
  const [isMonitoringOpen, setIsMonitoringOpen] = useState(false);
  const [isAutoTrading, setIsAutoTrading] = useState(false);

  // 워크플로우 변경 감지 및 자동 매매 체크
  useEffect(() => {
    if (workflow) {
      // 1. 워크플로우의 단계에서 market_monitoring_agent가 있는지 확인
      const hasMarketMonitoring = workflow.steps.some(
        (step: WorkflowStep) => step.agentName === "market_monitoring_agent"
      );
      
      // 2. 워크플로우의 JSON 문자열을 검사하여 get_monitoring_stock 함수 호출 확인
      let hasMonitoringTool = false;
      try {
        // 워크플로우 객체를 문자열로 변환하여 텍스트 검색
        const workflowStr = JSON.stringify(workflow);
        hasMonitoringTool = workflowStr.includes("get_monitoring_stock");
      } catch (err) {
        console.error("워크플로우 분석 중 오류:", err);
      }
      
      // 자동 매매 또는 모니터링이 감지되면 모니터링 패널을 엽니다
      if ((hasMarketMonitoring || hasMonitoringTool) && !isAutoTrading) {
        setIsAutoTrading(true);
        setIsMonitoringOpen(true);
      }
    }
  }, [workflow, isAutoTrading]);

  // 마지막 응답 메시지에서 모니터링 관련 텍스트 감지
  useEffect(() => {
    if (messages.length > 0 && !isAutoTrading) {
      // 마지막 메시지가 어시스턴트의 메시지인지 확인
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant" && lastMessage.type === "text") {
        const content = typeof lastMessage.content === 'string' 
          ? lastMessage.content 
          : JSON.stringify(lastMessage.content);
          
        // 메시지에 모니터링 관련 텍스트가 포함되어 있는지 확인
        if (
          content.includes("get_monitoring_stock") ||
          (content.includes("모니터링") && content.includes("TSLA")) ||
          (content.includes("monitoring") && content.includes("TSLA"))
        ) {
          setIsAutoTrading(true);
          setIsMonitoringOpen(true);
        }
      }
    }
  }, [messages, isAutoTrading]);

  const handleSendMessage = useCallback(
    async (
      content: string,
      config: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
    ) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      await sendMessage(
        {
          id: nanoid(),
          role: "user",
          type: "text",
          content,
        },
        { 
          ...config, 
          abortSignal: abortController.signal 
        }
      );
      abortControllerRef.current = null;
    },
    [],
  );
  
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex min-h-screen min-w-page flex-col items-center">
        <header className="fixed left-0 right-0 top-0 flex h-16 w-full items-center px-4">
          <AppHeader />
        </header>
        <main className="mb-48 mt-16 px-4">
          <MessageHistoryView
            className="w-page"
            messages={messages}
            loading={responding}
          />
        </main>
        
        {/* 모니터링 패널 - 오른쪽에 고정 배치 */}
        {isAutoTrading && (
          <div className="fixed right-4 top-20 w-80 z-50">
            <MarketMonitoring 
              isOpen={isMonitoringOpen}
              onToggle={() => setIsMonitoringOpen(!isMonitoringOpen)}
            />
          </div>
        )}
        
        <footer
          className={cn(
            "fixed bottom-4 transition-transform duration-500 ease-in-out",
            messages.length === 0 ? "w-[640px] translate-y-[-34vh]" : "w-page",
          )}
        >
          {messages.length === 0 && (
            <div className="flex w-[640px] translate-y-[-32px] flex-col">
              <h3 className="mb-2 text-center text-3xl font-medium">
                🔥 Just Buy It! 🔥
              </h3>
              <div className="px-4 text-center text-lg text-gray-400">
                No need to think, just buy.
                <br />
                Automated trading, stock info, account overview, and meme stock picks.
              </div>
            </div>
          )}
          <div className="flex flex-col overflow-hidden rounded-[24px] border bg-white shadow-lg">
            <InputBox
              size={messages.length === 0 ? "large" : "normal"}
              responding={responding}
              onSend={handleSendMessage}
              onCancel={() => {
                abortControllerRef.current?.abort();
                abortControllerRef.current = null;
              }}
            />
          </div>
          <div className="absolute bottom-[-32px] h-8 w-page backdrop-blur-sm" />
        </footer>
      </div>
    </div>
  );
}
