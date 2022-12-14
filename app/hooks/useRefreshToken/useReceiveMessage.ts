import { useCallback, useEffect } from "react";

import { clearTimeoutIfexist } from ".";

import type { TListenEventCallback } from "../useBroadcastChannel";

export interface MessageData {
  token?: string | null;
  reload?: boolean;
  pathname?: string;
  fromController?: boolean;
}

export const useReceiveMessage = ({
  listenToMessage,
  removeMessageListener,
  savePersistRefresh,
  isController,
  timerId,
  token,
}: {
  listenToMessage: TListenEventCallback<MessageData>;
  removeMessageListener: TListenEventCallback<MessageData>;
  savePersistRefresh: React.MutableRefObject<any>;
  isController: boolean;
  timerId: React.MutableRefObject<number | NodeJS.Timeout | null>;
  token?: string | null;
}) => {
  const listenMessageCallback = useCallback(
    ({ data }: { data: MessageData }) => {
      if (data.pathname === "logout") {
        if (data.fromController) {
          window.location.reload();
        } else if (isController) {
          savePersistRefresh.current.submit(
            { token },
            { action: "/action/destroy-token", method: "post" }
          );
        }
        // return;
      }
      // if (data.reload && data.pathname !== "logout") {
      else if (data.reload && data.pathname !== "logout") {
        window.location.reload();
        // return;
      } else {
        savePersistRefresh.current.submit(
          { token: data.token },
          { action: ".", method: "get" }
        );
      }
    },
    [savePersistRefresh, isController, token]
  );

  const listinerCondition = useCallback(() => {
    if (isController) return;
    clearTimeoutIfexist(timerId);
  }, [isController, timerId]);

  useEffect(() => {
    listinerCondition();
    listenToMessage(listenMessageCallback);
    return () => {
      removeMessageListener(listenMessageCallback);
    };
  }, [
    listenToMessage,
    removeMessageListener,
    listenMessageCallback,
    listinerCondition,
  ]);
};
