import { ArrowUpOutlined, GlobalOutlined, LikeOutlined, CommentOutlined, UserOutlined } from "@ant-design/icons";
import { type KeyboardEvent, useCallback, useEffect, useState, useRef } from "react";

import { Atom } from "~/core/icons";
import { cn } from "~/core/utils";
import { type Message } from "~/core/messaging";

export function InputBox({
  className,
  size,
  responding,
  onSend,
  onCancel,
}: {
  className?: string;
  size?: "large" | "normal";
  responding?: boolean;
  onSend?: (
    message: string,
    options: { deepThinkingMode: boolean; searchBeforePlanning: boolean; isRecommend?: boolean },
  ) => void;
  onCancel?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [deepThinkingMode, setDeepThinkMode] = useState(false);
  const [searchBeforePlanning, setSearchBeforePlanning] = useState(false);
  const [imeStatus, setImeStatus] = useState<"active" | "inactive">("inactive");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const saveConfig = useCallback(() => {
    localStorage.setItem(
      "langmanus.config.inputbox",
      JSON.stringify({ deepThinkingMode, searchBeforePlanning }),
    );
  }, [deepThinkingMode, searchBeforePlanning]);
  useEffect(() => {
    const config = localStorage.getItem("langmanus.config.inputbox");
    if (config) {
      const { deepThinkingMode, searchBeforePlanning } = JSON.parse(config);
      setDeepThinkMode(deepThinkingMode);
      setSearchBeforePlanning(searchBeforePlanning);
    }
  }, []);
  useEffect(() => {
    saveConfig();
  }, [deepThinkingMode, searchBeforePlanning, saveConfig]);
  
  const handleSendMessage = useCallback((isRecommend = false) => {
    if (responding) {
      onCancel?.();
    } else {
      if (message.trim() === "") {
        return;
      }
      if (onSend) {
        // isRecommend 플래그를 추가하여 상위 컴포넌트에서 구분하도록 함
        onSend(message, { deepThinkingMode, searchBeforePlanning, isRecommend });
        setMessage("");
      }
    }
  }, [
    responding,
    onCancel,
    message,
    onSend,
    deepThinkingMode,
    searchBeforePlanning,
  ]);
  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (responding) {
        return;
      }
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        imeStatus === "inactive"
      ) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [responding, imeStatus, handleSendMessage],
  );
  
  // 메시지 설정 후 전송 함수
  const setMessageAndSend = useCallback((text: string, isRecommend = true) => {
    setMessage(text);
    // 다음 렌더링 사이클에서 메시지 전송
    setTimeout(() => {
      handleSendMessage(isRecommend);
    }, 10);
  }, [handleSendMessage]);
  
  return (
    <div className={cn(className)}>
      <div className="w-full">
        <textarea
          ref={textareaRef}
          className={cn(
            "m-0 w-full resize-none border-none px-4 py-3 text-lg",
            size === "large" ? "min-h-32" : "min-h-4",
          )}
          placeholder="What do you want to do?"
          value={message}
          onCompositionStart={() => setImeStatus("active")}
          onCompositionEnd={() => setImeStatus("inactive")}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
      </div>
      <div className="flex items-center px-4 py-2">
        <div className="flex flex-grow items-center gap-2">
          <button
            className="flex h-8 items-center gap-2 rounded-2xl border px-4 text-sm text-button transition-shadow hover:bg-button-hover hover:text-button-hover hover:shadow"
            onClick={() => {
              setMessageAndSend("멘션 순에 따라서 주식 추천해줘");
            }}
          >
            <CommentOutlined className="h-4 w-4" />
            <span>멘션 순</span>
          </button>
          <button
            className="flex h-8 items-center gap-2 rounded-2xl border px-4 text-sm text-button transition-shadow hover:bg-button-hover hover:text-button-hover hover:shadow"
            onClick={() => {
              setMessageAndSend("좋아요 순에 따라서 주식 추천해줘");
            }}
          >
            <LikeOutlined className="h-4 w-4" />
            <span>좋아요 순</span>
          </button>
          <button
            className="flex h-8 items-center gap-2 rounded-2xl border px-4 text-sm text-button transition-shadow hover:bg-button-hover hover:text-button-hover hover:shadow"
            onClick={() => {
              setMessageAndSend("유저 언급 순이 많은 것에 따라서 주식 추천해줘");
            }}
          >
            <UserOutlined className="h-4 w-4" />
            <span>언급 순</span>
          </button>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            className={cn(
              "h-10 w-10 rounded-full text-button transition-shadow hover:bg-button-hover hover:text-button-hover hover:shadow",
              responding ? "bg-button-hover" : "bg-button",
            )}
            title={responding ? "Cancel" : "Send"}
            onClick={() => handleSendMessage()}
          >
            {responding ? (
              <div className="flex h-10 w-10 items-center justify-center">
                <div className="h-4 w-4 rounded bg-red-300" />
              </div>
            ) : (
              <ArrowUpOutlined />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}