"use client"

import React from "react"
import { Conversation } from "./types"
import { XIcon, SparklesIcon, SendIcon } from "lucide-react"

interface CustomerPreviewModalProps {
  conversation: Conversation
  isOpen: boolean
  onClose: () => void
}

export function CustomerPreviewModal({
  conversation,
  isOpen,
  onClose,
}: CustomerPreviewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[380px] bg-white text-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col h-[620px] max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Widget Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-neutral-900 text-white font-semibold text-xs grid place-items-center">
              {conversation.assignedTo ? conversation.assignedTo[0] : "G"}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 leading-tight">
                {conversation.assignedTo || "GauravDesk Support"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-neutral-500">Active now</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Translation Banner if Multilingual */}
        {conversation.isAutoTranslating && (
          <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span>🇪🇸</span>
              <span>Visualizando en Español (Traducción en vivo)</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">AI</span>
          </div>
        )}

        {/* Message Thread in Customer's View */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#fbfbfb]">
          {conversation.messages
            .filter((m) => m.sender !== "system")
            .map((msg) => {
              const isCustomer = msg.sender === "customer"
              const displayContent =
                conversation.isAutoTranslating && msg.translatedText
                  ? msg.translatedText
                  : msg.text

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      isCustomer
                        ? "bg-neutral-900 text-white rounded-br-sm shadow-sm"
                        : "bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {displayContent}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {msg.seen || msg.timestamp}
                  </span>
                </div>
              )
            })}
        </div>

        {/* Customer Input Box */}
        <div className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2">
          <input
            type="text"
            readOnly
            placeholder="Type your message..."
            className="flex-1 h-10 px-3.5 rounded-full bg-neutral-100 text-xs text-neutral-600 outline-none cursor-not-allowed"
          />
          <button
            disabled
            className="size-9 rounded-full bg-neutral-900 text-white grid place-items-center opacity-60 cursor-not-allowed"
          >
            <SendIcon className="size-3.5" />
          </button>
        </div>

        {/* Widget Footer */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
          <SparklesIcon className="size-3 text-neutral-400" />
          <span>Powered by GauravDesk Grounded AI</span>
        </div>
      </div>
    </div>
  )
}
