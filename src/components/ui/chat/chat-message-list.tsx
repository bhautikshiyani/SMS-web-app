import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAutoScroll } from "@/components/ui/chat/useAutoScroll";
import { CardContent } from "../card";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}
const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, smooth = false, ...props }, ref) => {
    const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } =
      useAutoScroll({
        smooth,
        content: children,
      });

    return (
      <>
        <CardContent
          className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
          ref={ref ?? scrollRef} // combine passed ref with internal scrollRef if needed
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <div className="flex flex-col items-start space-y-10 py-8">{children}</div>
        </CardContent>

        {!isAtBottom && (
          <Button
            onClick={() => scrollToBottom()}
            size="icon"
            variant="outline"
            className="absolute bottom-18 cursor-pointer left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="size-4" />
          </Button>
        )}
      </>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
