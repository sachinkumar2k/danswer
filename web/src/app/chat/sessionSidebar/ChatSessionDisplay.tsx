"use client";

import { useRouter } from "next/navigation";
import { ChatSession } from "../interfaces";
import { useState, useEffect, useRef } from "react";
import { deleteChatSession, renameChatSession } from "../lib";
import { DeleteChatModal } from "../modal/DeleteChatModal";
import { BasicSelectable } from "@/components/BasicClickable";
import Link from "next/link";
import {
  FiCheck,
  FiEdit2,
  FiMoreHorizontal,
  FiShare2,
  FiTrash,
  FiX,
} from "react-icons/fi";
import { DefaultDropdownElement } from "@/components/Dropdown";
import { Popover } from "@/components/popover/Popover";
import { ShareChatSessionModal } from "../modal/ShareChatSessionModal";
import { CHAT_SESSION_ID_KEY, FOLDER_ID_KEY } from "@/lib/drag/constants";
import { usePopup } from "@/components/admin/connectors/Popup";

export function ChatSessionDisplay({
  chatSession,
  search,
  isSelected,
  skipGradient,
}: {
  chatSession: ChatSession;
  isSelected: boolean;
  search?: boolean;
  // needed when the parent is trying to apply some background effect
  // if not set, the gradient will still be applied and cause weirdness
  skipGradient?: boolean;
}) {
  const router = useRouter();

  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [isMoreOptionsDropdownOpen, setIsMoreOptionsDropdownOpen] =
    useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [chatName, setChatName] = useState(chatSession.name);
  const [delayedSkipGradient, setDelayedSkipGradient] = useState(skipGradient);

  const { popup, setPopup } = usePopup();
  useEffect(() => {
    if (skipGradient) {
      setDelayedSkipGradient(true);
    } else {
      const timer = setTimeout(() => {
        setDelayedSkipGradient(skipGradient);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [skipGradient]);

  const onRename = async () => {
    const response = await renameChatSession(chatSession.id, chatName);
    if (response.ok) {
      setIsRenamingChat(false);
      router.refresh();
    } else {
      alert("Failed to rename chat session");
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  const handleDeleteClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      const response = await deleteChatSession(chatSession.id);
      if (response.ok) {
        router.push("/chat");
      } else {
        alert("Failed to delete chat session");
      }
      router.refresh();
    } catch (error) {
      setPopup({ message: "Failed to delete folder", type: "error" });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        deleteConfirmRef.current &&
        !deleteConfirmRef.current.contains(event.target as Node)
      ) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {isShareModalVisible && (
        <ShareChatSessionModal
          chatSessionId={chatSession.id}
          existingSharedStatus={chatSession.shared_status}
          onClose={() => setIsShareModalVisible(false)}
        />
      )}
      {showDeleteConfirm && (
        <div
          ref={deleteConfirmRef}
          className="absolute max-w-xs border z-[100] border-neutral-300 top-0 right-0 w-[250px] -bo-0 top-2 mt-4 p-2 bg-background-100 rounded shadow-lg z-10"
        >
          <p className="text-sm mb-2">
            Are you sure you want to delete this chat session? All the content
            inside this session will be deleted.
          </p>
          <div className="flex justify-end">
            <button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs mr-2"
            >
              Yes
            </button>
            <button
              onClick={cancelDelete}
              className="bg-gray-300 hover:bg-gray-200 px-2 py-1 rounded text-xs"
            >
              No
            </button>
          </div>
        </div>
      )}

      <Link
        className="flex my-1 relative"
        key={chatSession.id}
        href={
          search
            ? `/search?searchId=${chatSession.id}`
            : `/chat?chatId=${chatSession.id}`
        }
        scroll={false}
        draggable="true"
        onDragStart={(event) => {
          event.dataTransfer.setData(
            CHAT_SESSION_ID_KEY,
            chatSession.id.toString()
          );
          event.dataTransfer.setData(
            FOLDER_ID_KEY,
            chatSession.folder_id?.toString() || ""
          );
        }}
      >
        <BasicSelectable padding="extra" fullWidth selected={isSelected}>
          <>
            <div className="flex relative">
              {isRenamingChat ? (
                <input
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onRename();
                      event.preventDefault();
                    }
                  }}
                  className="-my-px px-1 mr-2 w-full rounded"
                />
              ) : (
                <p className="break-all overflow-hidden whitespace-nowrap mr-3 text-emphasis">
                  {chatName || `Chat ${chatSession.id}`}
                </p>
              )}
              {isSelected &&
                (isRenamingChat ? (
                  <div className="ml-auto my-auto flex">
                    <div
                      onClick={onRename}
                      className={`hover:bg-black/10 p-1 -m-1 rounded`}
                    >
                      <FiCheck size={16} />
                    </div>
                    <div
                      onClick={() => {
                        setChatName(chatSession.name);
                        setIsRenamingChat(false);
                      }}
                      className={`hover:bg-black/10 p-1 -m-1 rounded ml-2`}
                    >
                      <FiX size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="ml-auto my-auto flex z-30">
                    <div>
                      <div
                        onClick={() => {
                          setIsMoreOptionsDropdownOpen(
                            !isMoreOptionsDropdownOpen
                          );
                        }}
                        className={"-m-1"}
                      >
                        <Popover
                          open={isMoreOptionsDropdownOpen}
                          onOpenChange={(open: boolean) =>
                            setIsMoreOptionsDropdownOpen(open)
                          }
                          content={
                            <div className="hover:bg-black/10 p-1 rounded">
                              <FiMoreHorizontal size={16} />
                            </div>
                          }
                          popover={
                            <div className="border border-border rounded-lg bg-background z-50 w-32">
                              <DefaultDropdownElement
                                name="Share"
                                icon={FiShare2}
                                onSelect={() => setIsShareModalVisible(true)}
                              />
                              <DefaultDropdownElement
                                name="Rename"
                                icon={FiEdit2}
                                onSelect={() => setIsRenamingChat(true)}
                              />
                            </div>
                          }
                          requiresContentPadding
                          sideOffset={6}
                          triggerMaxWidth
                        />
                      </div>
                    </div>
                    <div
                      onClick={(e) => handleDeleteClick(e)}
                      className={`hover:bg-black/10 p-1 -m-1 rounded ml-2`}
                    >
                      <FiTrash size={16} />
                    </div>
                  </div>
                ))}
            </div>
            {isSelected && !isRenamingChat && !delayedSkipGradient && (
              <div className="absolute bottom-0 right-0 top-0 bg-gradient-to-l to-transparent from-hover w-20 from-60% rounded" />
            )}
            {!isSelected && !delayedSkipGradient && (
              <div className="absolute bottom-0 right-0 top-0 bg-gradient-to-l to-transparent from-background-100 w-8 from-0% rounded" />
            )}
          </>
        </BasicSelectable>
      </Link>
    </>
  );
}
