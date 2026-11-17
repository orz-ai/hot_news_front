import { Dispatch, SetStateAction } from "react";
import { PublicEndpoint } from "../../lib/public-api";
import RequestParameters from "./RequestParameters";
import RequestConsole from "./RequestConsole";

export interface ApiRequestPanelProps {
  endpoint: PublicEndpoint;
  values: Record<string, string>;
  onValuesChange: Dispatch<SetStateAction<Record<string, string>>>;
  requestUrl: string;
  result: string;
  status: number | null;
  duration: number | null;
  error: string;
  loading: boolean;
  missingRequired: boolean;
  onSend: () => void;
}

export default function ApiRequestPanel(props: ApiRequestPanelProps) {
  return (
    <div className="min-w-0 space-y-6">
      <RequestParameters endpoint={props.endpoint} values={props.values} onValuesChange={props.onValuesChange} />
      <RequestConsole {...props} />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200">
        API 当前无需认证，也没有明确的调用额度限制。请合理控制频率；带有 <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">refresh=true</code> 的请求可能触发重新计算，不建议高频调用。
      </div>
    </div>
  );
}
