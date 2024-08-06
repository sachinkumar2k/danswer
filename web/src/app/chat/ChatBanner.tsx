"use client";

import ReactMarkdown from "react-markdown";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { useContext } from "react";
import remarkGfm from "remark-gfm";
import { InfoIcon } from "@/components/icons/icons";

export function ChatBanner() {
  const settings = useContext(SettingsContext);
  if (!settings?.enterpriseSettings?.custom_header_content) {
    return null;
  }

  return (
    <div
      className={`
        mb-2
        px-2
        z-[39] 
        h-[4rem]
        text-wrap
        w-[96%] 
        mx-auto
        bg-background-100
        shadow-sm
        rounded
        border-l-8 border-l-400
        border-r-4 border-r-200
        border-border
        border
        flex`}
    >
      <div className="mx-auto text-emphasis text-sm flex flex-col">
        <div className="inline-block my-auto">
          <ReactMarkdown
            className="prose flex text-wrap break-word text-wrap max-w-full"
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-sm text-link hover:text-link-hover"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              p: ({ node, ...props }) => (
                <p
                  {...props}
                  className="text-wrap break-word line-clamp-2 text-sm"
                />
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {settings.enterpriseSettings.custom_header_content}
          </ReactMarkdown>
          <span className="">
            <InfoIcon />
          </span>
        </div>
      </div>
    </div>
  );
}
