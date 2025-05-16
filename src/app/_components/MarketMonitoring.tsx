import { useState, useEffect, useRef } from "react";
import { 
  UpOutlined, 
  DownOutlined, 
  LoadingOutlined,
  FireOutlined,
  StarOutlined
} from "@ant-design/icons";
import { env } from "~/env";
import { cn } from "~/core/utils";

type MonitoringLogs = Record<string, string[]>;

export function MarketMonitoring({
  className,
  isOpen = false,
  onToggle,
}: {
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const [logs, setLogs] = useState<MonitoringLogs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickerBoxes, setTickerBoxes] = useState<Record<string, number>>({});
  const [lastLogs, setLastLogs] = useState<Record<string, string>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 목업 데이터 - 실제 API가 없을 때 테스트용
  const mockData = {
    logs: {
      "TSLA": [
        "2024-04-28 09:32:12 - TSLA 가격: $147.05, 거래량: 5,245,107",
        "2024-04-28 09:33:45 - TSLA 지지선 $145.80 접근 중, RSI: 42.3",
        "2024-04-28 09:35:22 - TSLA 모멘텀 약화, MACD 하락세"
      ],
      "AAPL": [
        "2024-04-28 09:30:05 - AAPL 가격: $169.30, 거래량: 3,547,901",
        "2024-04-28 09:32:18 - AAPL 상승 추세, 이동평균선 위에서 거래 중"
      ]
    }
  };

  useEffect(() => {
    // 컴포넌트가 열려있을 때만 모니터링을 시작합니다.
    if (isOpen) {
      const fetchMonitoringStatus = async () => {
        try {
          // 실제 API 호출 시도
          const apiEndpoints = [
            `${env.NEXT_PUBLIC_API_URL}/monitoring_status`
          ];
          
          let apiSuccess = false;
          
          // 여러 가능한 엔드포인트를 시도합니다
          for (const endpoint of apiEndpoints) {
            try {
              const res = await fetch(endpoint);
              if (res.status === 200) {
                const data = await res.json();
                processLogs(data.logs || {});
                apiSuccess = true;
                break;
              }
            } catch (err) {
              // 개별 엔드포인트 오류는 무시하고 다음 엔드포인트 시도
              console.warn(`엔드포인트 ${endpoint} 접속 실패`);
            }
          }
          
          // 모든 API 시도 실패 시 목업 데이터 사용
          if (!apiSuccess) {
            console.info("실제 API 연결 실패, 목업 데이터 사용");
            processLogs(mockData.logs);
          }
          
          setLoading(false);
        } catch (err) {
          console.error("모니터링 상태 가져오기 오류:", err);
          setError("모니터링 상태를 가져오는 중 오류가 발생했습니다.");
          // 실패 시 목업 데이터 사용
          processLogs(mockData.logs);
          setLoading(false);
        }
      };
      
      // 로그 데이터 처리 함수
      const processLogs = (newLogs: MonitoringLogs) => {
        setLogs(prevLogs => {
          const updatedTickerBoxes = { ...tickerBoxes };
          const updatedLastLogs = { ...lastLogs };
          
          // 각 ticker에 대해 로그 업데이트
          Object.entries(newLogs).forEach(([ticker, lines]) => {
            if (!Array.isArray(lines) || lines.length === 0) return;
            
            const latest = lines[lines.length - 1] as string;
            
            // 로그가 변경된 경우에만 업데이트
            if (updatedLastLogs[ticker] !== latest) {
              updatedLastLogs[ticker] = latest;
              updatedTickerBoxes[ticker] = (updatedTickerBoxes[ticker] || 0) + 1;
            }
          });
          
          setTickerBoxes(updatedTickerBoxes);
          setLastLogs(updatedLastLogs);
          return newLogs;
        });
      };

      // 첫 번째 요청
      fetchMonitoringStatus();
      
      // 주기적으로 모니터링 상태를 가져옵니다 (2초마다)
      intervalRef.current = setInterval(fetchMonitoringStatus, 2000);
      
      return () => {
        // 컴포넌트가 언마운트되거나 isOpen이 false로 변경될 때 인터벌을 정리합니다.
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isOpen, tickerBoxes, lastLogs]);

  return (
    <div className={cn("border rounded-lg shadow-lg bg-white", className)}>
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="font-medium text-lg flex items-center gap-2">
          <FireOutlined className="text-red-500" />
          시장 모니터링
        </h3>
        <div className="flex items-center gap-2">
          {loading && <LoadingOutlined spin />}
          {isOpen ? <UpOutlined /> : <DownOutlined />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {error && (
            <div className="text-red-500 p-2 mb-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          
          {Object.keys(logs).length === 0 && !loading && !error ? (
            <div className="text-gray-500 text-center py-4">
              모니터링 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(logs).map(([ticker, lines]) => {
                if (!Array.isArray(lines) || lines.length === 0) return null;
                
                const latest = lines[lines.length - 1];
                const alternateIcon = (tickerBoxes[ticker] || 0) % 2 === 0 ? 
                  <StarOutlined className="text-yellow-500" /> : 
                  <FireOutlined className="text-red-500" />;
                
                return (
                  <div 
                    key={ticker}
                    className="p-2 bg-blue-50 rounded border border-blue-100"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1">{alternateIcon}</div>
                      <div>
                        <span className="font-bold">{ticker}:</span> {latest}
                      </div>
                    </div>
                    {lines.length > 1 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <details>
                          <summary className="cursor-pointer">이전 모니터링 기록 ({lines.length - 1})</summary>
                          <ul className="mt-1 space-y-1 pl-4">
                            {lines.slice(0, -1).reverse().map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 