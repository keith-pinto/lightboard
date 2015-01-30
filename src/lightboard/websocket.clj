(ns lightboard.websocket 
  (:require [org.httpkit.server :as http-kit]
            [clojure.tools.logging :as log]
            [clj-wamp.server :as wamp]
            [lightboard.core :as lb]
            ))

;; Topic BaseUrls
(def base-url "http://wamptutorial")
(def rpc-base-url (str base-url "/rpc#"))
(def evt-base-url (str base-url "/event#"))

(defn rpc-url [path] (str rpc-base-url path))
(defn evt-url [path] (str evt-base-url path))

;; HTTP Kit/WAMP WebSocket handler
(defn- on-open [sess-id]
  (lb/add-user! sess-id)
  (lb/add-active-user! sess-id)
  (log/info "WAMP client connected [" sess-id "]"))

(defn- on-close [sess-id status]
  (lb/remove-user! sess-id)
  (lb/assign-next-active-user!)
  (log/info "WAMP client disconnected [" sess-id "] " status))

(defn- on-publish [sess-id topic event exclude include]
  (log/info "WAMP publish:" sess-id topic event exclude include))

(defn- on-before-call [sess-id topic call-id call-params]
  (log/info "WAMP call:" sess-id topic call-id call-params)
  [sess-id topic call-id call-params])

(defn- broadcast-state []
  (log/info "Checking what is topic: " (evt-url "state"))
  (wamp/broadcast-event! (evt-url "state") (@lb/app-state :cells) []))

(defn- on-place-cell
  [data]
  (lb/place-cell! (data "cellno") (data "sess-id"))
  (broadcast-state)
  (log/info (data "cellno") (data "sess-id"))
  (log/info "No. of Cells: " (-> @lb/app-state :cells count))
  true)

(defn wamp-handler
  "Returns a http-kit websocket handler with wamp subprotocol"
  [req]
  (wamp/with-channel-validation req channel #"https?://localhost:3000"
    (wamp/http-kit-handler channel
      {:on-open        on-open
       :on-close       on-close
       :on-call        {(rpc-url "placeCell") on-place-cell
                        (rpc-url "echo")  identity
                        (rpc-url "ping")  (fn [] "pong")
                        (rpc-url "throw") (fn [] (throw (Exception. "An exception")))
                        :on-before        on-before-call}
       :on-subscribe   {(evt-url "chat")  true
                        (evt-url "state") true}
       :on-publish     {(evt-url "chat")  true
                        :on-after         on-publish}
       })))
