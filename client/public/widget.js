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

  // Create floating container with transparent background
  var container = document.createElement("div")
  container.id = "gauravdesk-widget-container"
  container.style.position = "fixed"
  container.style.zIndex = "2147483647"
  container.style.border = "none"
  container.style.background = "transparent"
  container.style.backgroundColor = "transparent"
  container.style.overflow = "hidden"
  container.style.transition = "width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1)"

  // Initial launcher state
  container.style.width = "72px"
  container.style.height = "72px"
  container.style.top = "auto"
  container.style.bottom = "20px"
  if (isLeft) {
    container.style.left = "20px"
    container.style.right = "auto"
  } else {
    container.style.right = "20px"
    container.style.left = "auto"
  }

  // Derive host domain from current page
  var hostDomain = window.location.hostname || window.location.host
  var widgetUrl = new URL(baseUrl + "/widget/" + encodeURIComponent(workspaceId))
  if (hostDomain) {
    widgetUrl.searchParams.set("host", hostDomain)
  }

  // Create widget iframe
  var iframe = document.createElement("iframe")
  iframe.id = "gauravdesk-widget-frame"
  iframe.src = widgetUrl.toString()
  iframe.style.width = "100%"
  iframe.style.height = "100%"
  iframe.style.border = "none"
  iframe.style.background = "transparent"
  iframe.style.backgroundColor = "transparent"
  iframe.style.colorScheme = "normal"
  iframe.allow = "clipboard-write; autoplay"
  iframe.title = "GauravDesk Customer Support Chat"

  container.appendChild(iframe)

  // Attach to DOM once ready
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

    if (open) {
      var isMobile = window.innerWidth <= 640
      if (isMobile) {
        container.style.width = "100vw"
        container.style.height = "100dvh"
        container.style.top = "0"
        container.style.bottom = "0"
        container.style.left = "0"
        container.style.right = "0"
        container.style.borderRadius = "0px"
      } else {
        container.style.width = "380px"
        container.style.height = "600px"
        container.style.maxWidth = "calc(100vw - 32px)"
        container.style.maxHeight = "calc(100vh - 40px)"
        container.style.top = "auto"
        container.style.bottom = "20px"
        container.style.borderRadius = "16px"
        if (alignLeft) {
          container.style.left = "20px"
          container.style.right = "auto"
        } else {
          container.style.right = "20px"
          container.style.left = "auto"
        }
      }
    } else {
      container.style.width = "72px"
      container.style.height = "72px"
      container.style.top = "auto"
      container.style.bottom = "20px"
      container.style.borderRadius = "50%"
      if (alignLeft) {
        container.style.left = "20px"
        container.style.right = "auto"
      } else {
        container.style.right = "20px"
        container.style.left = "auto"
      }
    }
  }

  // Handle dynamic browser window resizing
  window.addEventListener("resize", function () {
    if (isChatOpen) {
      applySize(true, preferredPosition)
    }
  })

  // Cross-frame communication listener
  window.addEventListener("message", function (event) {
    if (event.data && typeof event.data === "object") {
      if (event.data.type === "gauravdesk:unauthorized") {
        console.warn(
          "[GauravDesk] Chatbot embedding blocked: domain \"" +
            (window.location.hostname || "unknown") +
            "\" is not in the workspace allowed domains list."
        )
        if (container && container.parentNode) {
          container.parentNode.removeChild(container)
        }
        return
      }
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
