(ns lightboard.core
  (:require [clojure.tools.logging :as log]))

(def app-state (atom {:cells {}
                      :users {}
                      }))

(def all-users (atom []))

(def colors ["red" "yellow"])

(def max-users-allowed 2)

;utils

(defn in? 
    "true if seq contains elm"
    [seq elm]  
    (some #(= elm %) seq))

(defn s-diff
  "If s1 and s2 are sequences, then function returns s2-s1"
  [s1 s2]
  (filter #(nil? (in? s1 %)) s2))

;functions

(defn get-cell-color
  [cellno]
  ((@app-state :cells) cellno))

(defn get-active-users-count []
  (-> @app-state :users count))

(defn get-user-color [sess-id]
  (get-in @app-state [:users sess-id]))

(defn toggle-color [old-color new-color]
  (if (in? colors old-color)
    "white"
    new-color))

(defn place-cell!
  [cellno sess-id]
  (log/info "updating cell: " cellno)
  (let [cell-color (get-cell-color cellno)]
    (swap! app-state 
           assoc-in [:cells cellno] 
           (toggle-color 
             cell-color 
             (get-user-color sess-id)))))

(defn get-used-colors []
  (vals (@app-state :users)))

(defn get-active-users []
  (keys (@app-state :users)))

(defn get-available-colors []
  (let [used-colors (get-used-colors)]
    (s-diff used-colors colors)))

(defn get-available-users []
  (let [users (get-active-users)]
    (s-diff users @all-users)))

(defn add-user! [sess-id]
  (swap! all-users conj sess-id))

(defn remove-user! [sess-id] 
  (reset! all-users (remove #(= sess-id %) @all-users))
  (swap! app-state assoc-in [:users] (dissoc (@app-state :users) sess-id)))

(defn add-active-user! [sess-id]
  (if (< (get-active-users-count) max-users-allowed)
    (swap! app-state 
           assoc-in [:users sess-id]
           (first (get-available-colors)))))

(defn assign-next-active-user! []
  (add-active-user! (first (get-available-users))))

