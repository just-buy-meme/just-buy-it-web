import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { parse } from "best-effort-json-parser";
import { useMemo, useState } from "react";

import { Atom } from "~/core/icons";
import { cn } from "~/core/utils";
import {
  type WorkflowStep,
  type Workflow,
  type ThinkingTask,
} from "~/core/workflow";

import { Markdown } from "./Markdown";
import { ToolCallView } from "./ToolCallView";

export function WorkflowProgressView({
  className,
  workflow,
}: {
  className?: string;
  workflow: Workflow;
}) {
  const steps = useMemo(() => {
    // reporter는 제외하고, 각 agentName 당 가장 마지막 단계만 유지
    const filteredSteps: WorkflowStep[] = [];
    const seenAgents = new Set<string>();
    
    // 역순으로 순회하여 각 에이전트의 가장 최근 단계만 추가
    for (let i = workflow.steps.length - 1; i >= 0; i--) {
      const step = workflow.steps[i];
      if (step && step.agentName !== "reporter" && !seenAgents.has(step.agentName)) {
        // 해당 에이전트의 가장 최근 단계 추가
        filteredSteps.unshift(step); // 원래 순서 유지를 위해 배열 앞에 추가
        seenAgents.add(step.agentName);
      }
    }
    
    return filteredSteps;
  }, [workflow]);
  
  const reportStep = useMemo(() => {
    return workflow.steps.find((step) => step.agentName === "reporter");
  }, [workflow]);
  
  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex overflow-hidden rounded-2xl border", className)}>
        <aside className="flex w-[220px] flex-shrink-0 flex-col border-r bg-[rgba(0,0,0,0.02)]">
          <div className="flex-shrink-0 px-4 py-4 font-medium">Flow</div>
          <ol className="flex flex-grow list-disc flex-col gap-4 px-4 py-2">
            {steps.map((step) => (
              <li
                key={step.id}
                className="flex cursor-pointer items-center gap-2"
                onClick={() => {
                  const element = document.getElementById(step.id);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
              >
                <div className="flex h-2 w-2 rounded-full bg-gray-400"></div>
                <div>{getStepName(step)}</div>
              </li>
            ))}
          </ol>
        </aside>
        <main className="flex-grow overflow-auto bg-white p-4">
          <ul className="flex flex-col gap-4">
            {steps.map((step, stepIndex) => (
              <li key={step.id} className="flex flex-col gap-2">
                <h3 id={step.id} className="ml-[-4px] text-lg font-bold">
                  📍 Step {stepIndex + 1}: {getStepName(step)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {step.tasks
                    .filter(
                      (task) =>
                        !(
                          task.type === "thinking" &&
                          !task.payload.text &&
                          !task.payload.reason
                        ),
                    )
                    .map((task) =>
                      task.type === "thinking" &&
                      step.agentName === "planner" ? (
                        <PlanTaskView key={task.id} task={task} />
                      ) : (
                        <li key={task.id} className="flex">
                          {task.type === "thinking" ? (
                            <Markdown
                              className="pl-6 opacity-70"
                              style={{
                                fontSize: "smaller",
                              }}
                            >
                              {task.payload.text}
                            </Markdown>
                          ) : (
                            <ToolCallView task={task} />
                          )}
                        </li>
                      ),
                    )}
                </ul>
                {stepIndex < steps.length - 1 && <hr className="mb-4 mt-8" />}
              </li>
            ))}
          </ul>
        </main>
      </div>
      {reportStep && (
        <div className="flex flex-col gap-4 p-4">
          <Markdown>
            {reportStep.tasks[0]?.type === "thinking"
              ? reportStep.tasks[0].payload.text
              : ""}
          </Markdown>
        </div>
      )}
    </div>
  );
}

function PlanTaskView({ task }: { task: ThinkingTask }) {
  const plan = useMemo<{
    title?: string;
    steps?: { title?: string; description?: string }[];
  }>(() => {
    if (task.payload.text) {
      return parse(task.payload.text);
    }
    return {};
  }, [task]);
  const [showReason, setShowReason] = useState(true);
  const reason = task.payload.reason;
  const markdown = `${plan.title ?? ""}\n\n${plan.steps?.map((step) => `- ${step.title ?? ""}\n\n${step.description ?? ""}`).join("\n\n") ?? ""}`;
  return (
    <li key={task.id} className="flex flex-col">
      {reason && (
        <div>
          <div>
            <button
              className="mb-1 flex h-8 items-center gap-2 rounded-2xl border bg-button px-4 text-sm text-button hover:bg-button-hover hover:text-button-hover"
              onClick={() => setShowReason(!showReason)}
            >
              <Atom className="h-4 w-4" />
              <span>Deep Thought</span>
              {showReason ? (
                <UpOutlined className="text-xs" />
              ) : (
                <DownOutlined className="text-xs" />
              )}
            </button>
          </div>
          <div className={cn(showReason ? "block" : "hidden")}>
            <Markdown className="border-l-2 pl-6 text-sm opacity-70">
              {reason}
            </Markdown>
          </div>
        </div>
      )}
      <div>
        <Markdown className="pl-6 opacity-70" style={{ fontSize: "smaller" }}>{markdown ?? ""}</Markdown>
      </div>
    </li>
  );
}
// TEAM_MEMBERS = ["account_info_agent", "stock_info_agent", "trade_not_auto_agent", "market_monitoring_agent"]

function getStepName(step: WorkflowStep) {
  switch (step.agentName) {
    case "account_info_agent":
      return "Account Info";
    case "stock_info_agent":
      return "Stock Info";
    case "trade_not_auto_agent":
      return "Trading";
    case "market_monitoring_agent":
      return "Monitoring";
    case "planner":
      return "Planning";
    case "supervisor":
      return "Thinking";
    default:
      return step.agentName;
  }
}
