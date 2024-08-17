import React, { useRef } from "react";
import { useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiCopy } from "react-icons/fi";

interface CodeBlockProps {
  className?: string | undefined;
  children?: ReactNode;
  content: string;
  [key: string]: any;
}

export function CodeBlock({
  className = "",
  children,
  content,
  ...props
}: CodeBlockProps) {
  const language = className
    .split(" ")
    .filter((cls) => cls.startsWith("language-"))
    .map((cls) => cls.replace("language-", ""))
    .join(" ");
  const [copied, setCopied] = useState(false);

  if (!language) {
    return (
      <code {...props} className={`text-sm ${className}`}>
        {children}
      </code>
    );
  }

  let codeText: string | null = null;
  if (
    props.node?.position?.start?.offset &&
    props.node?.position?.end?.offset
  ) {
    codeText = content.slice(
      props.node.position.start.offset,
      props.node.position.end.offset
    );

    // Remove the language declaration and trailing backticks
    const codeLines = codeText.split("\n");
    if (codeLines.length > 1 && codeLines[0].startsWith("```")) {
      codeLines.shift(); // Remove the first line with the language declaration
      if (codeLines[codeLines.length - 1] === "```") {
        codeLines.pop(); // Remove the last line with the trailing backticks
      }
      codeText = codeLines.join("\n");
    }
  }

  const handleCopy = () => {
    if (!codeText) {
      return;
    }

    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copy status after 2 seconds
    });
  };

  return (
    <div className="w-full">
      <div className="flex mx-3 py-2 text-xs">
        {language}
        {codeText && (
          <div
            className="ml-auto cursor-pointer select-none"
            onClick={handleCopy}
          >
            {copied ? (
              <div className="flex items-center space-x-2">
                <FiCheck size={16} />
                <span>Copied!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FiCopy size={16} />
                <span>Copy code</span>
              </div>
            )}
          </div>
        )}
      </div>
      <pre {...props} className="overflow-x-auto" style={{ padding: "1rem" }}>
        <code className={`text-sm overflow-x-scroll ${className}`}>
          {children}
          testing testing testing testing testing testing testing testing
          testing testing testingtestingtesting testing testing testing testing
          testing testing testing testing testing testingtestingtesting testing
          testing testing testing testing testing testing testing testing
          testingtesting
        </code>
      </pre>
    </div>
  );
}
interface PortalCodeBlockProps {
  content: string;
  language?: string;
}

export const PortalCodeBlock: React.FC<PortalCodeBlockProps> = ({
  content,
  language,
}) => {
  const [container] = useState(() => document.createElement("div"));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.appendChild(container);
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(container);
      }
    };
  }, [container]);

  return (
    <div ref={containerRef}>
      {createPortal(
        <CodeBlock
          content={content}
          className={language ? `language-${language}` : ""}
        />,
        container
      )}
    </div>
  );
};
