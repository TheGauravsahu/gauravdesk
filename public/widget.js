/**
 * GauravDesk Official Chatbot Embed Script
 * Embeds the real-time AI customer support widget via a non-blocking floating iframe.
 */
;(function () {
  // Prevent multiple injections on the same page
  if (window.GauravDesk && window.GauravDesk.isLoaded) {
    return
  }

  // Locate the host script tag
  var currentScript =
    document.currentScript ||
    document.querySelector("script[data-workspace]") ||
    document.querySelector("script[src*='widget.js']")

  if (!currentScript) {
    console.error("[GauravDesk] Embed script tag could not be located.")
    return
  }

  var workspaceId = currentScript.getAttribute("data-workspace")
  if (!workspaceId) {
    // Try query param
    var parsedUrl = new URL(currentScript.src, window.location.href)
    workspaceId = parsedUrl.searchParams.get("workspace")
  }

  if (!workspaceId) {
    console.error("[GauravDesk] Missing required data-workspace attribute.")
    return
  }

  // Derive origin of the GauravDesk server from the script URL
  var scriptUrl = new URL(currentScript.src, window.location.href)
  var baseUrl = scriptUrl.origin

  var preferredPosition =
    currentScript.getAttribute("data-position") || "bottom-right"
  var isLeft = preferredPosition === "bottom-left"

  // Create floating container
  var container = document.createElement("div")
  container.id = "gauravdesk-widget-container"
  container.style.position = "fixed"
  container.style.zIndex = "2147483647"
  container.style.border = "none"
  container.style.background = "transparent"
  container.style.overflow = "hidden"
  container.style.transition = "width 0.25s ease-in-out, height 0.25s ease-in-out, transform 0.25s ease-in-out"

  // Sizing: initial collapsed launcher state
  container.style.width = "80px"
  container.style.height = "80px"
  container.style.bottom = "16px"
  if (isLeft) {
    container.style.left = "16px"
    container.style.right = "auto"
  } else {
    container.style.right = "16px"
    container.style.left = "auto"
  }

  // Create widget iframe
  var iframe = document.createElement("iframe")
  iframe.id = "gauravdesk-widget-frame"
  iframe.src = baseUrl + "/widget/" + encodeURIComponent(workspaceId)
  iframe.style.width = "100%"
  iframe.style.height = "100%"
  iframe.style.border = "none"
  iframe.style.background = "transparent"
  iframe.style.colorScheme = "normal"
  iframe.allow = "clipboard-write; autoplay"
  iframe.title = "GauravDesk Customer Support Chat"

  container.appendChild(iframe)

  // Attach to DOM once loaded
  function init() {
    if (!document.getElementById("gauravdesk-widget-container")) {
      document.body.appendChild(container)
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }

  var isChatOpen = false

  function applySize(open, position) {
    isChatOpen = open
    var alignLeft = position === "bottom-left"

    if (alignLeft) {
      container.style.left = "16px"
      container.style.right = "auto"
    } else {
      container.style.right = "16px"
      container.style.left = "auto"
    }

    if (open) {
      var isMobile = window.innerWidth <= 480
      if (isMobile) {
        container.style.width = "100vw"
        container.style.height = "100dvh"
        container.style.bottom = "0"
        container.style.left = "0"
        container.style.right = "0"
        container.style.borderRadius = "0px"
      } else {
        container.style.width = "380px"
        container.style.height = "640px"
        container.style.maxWidth = "calc(100vw - 32px)"
        container.style.maxHeight = "calc(100vh - 40px)"
        container.style.bottom = "16px"
        container.style.borderRadius = "16px"
      }
    } else {
      container.style.width = "80px"
      container.style.height = "80px"
      container.style.bottom = "16px"
      if (alignLeft) {
        container.style.left = "16px"
        container.style.right = "auto"
      } else {
        container.style.right = "16px"
        container.style.left = "auto"
      }
    }
  }

  // Cross-frame communication listener
  window.addEventListener("message", function (event) {
    if (event.data && typeof event.data === "object") {
      if (event.data.type === "gauravdesk:resize") {
        applySize(event.data.open, event.data.position || preferredPosition)
      }
    }
  })

  // Global developer SDK
  window.GauravDesk = {
    isLoaded: true,
    workspaceId: workspaceId,
    open: function () {
      iframe.contentWindow.postMessage({ type: "gauravdesk:set_open", open: true }, "*")
      applySize(true, preferredPosition)
    },
    close: function () {
      iframe.contentWindow.postMessage({ type: "gauravdesk:set_open", open: false }, "*")
      applySize(false, preferredPosition)
    },
    toggle: function () {
      iframe.contentWindow.postMessage({ type: "gauravdesk:toggle" }, "*")
    },
  }
})()
