(ns lightboard.core
  (:require [clojure.tools.logging :as log]))

(def app-state (atom {:cells #{}
                      :users []
                      }))

(def colors ["red" "yellow"])

(def max-users-allowed 2)

(defn place-cell 
  [cellno]
  (log/info "placed cell: " cellno))
