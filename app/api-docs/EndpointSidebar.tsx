import { PublicEndpoint } from "../../lib/public-api";

interface EndpointSidebarProps {
  groups: Record<string, PublicEndpoint[]>;
  selectedId: string;
  onSelect: (endpoint: PublicEndpoint) => void;
}

export default function EndpointSidebar({ groups, selectedId, onSelect }: EndpointSidebarProps) {
  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-3 shadow-card dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <h2 className="px-3 pb-3 pt-2 text-sm font-bold text-gray-900 dark:text-white">接口列表</h2>
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="mb-4 last:mb-0">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{group}</p>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${selectedId === item.id ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/60"}`}
            >
              <span className="mr-2 rounded bg-green-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">GET</span>
              {item.name}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
