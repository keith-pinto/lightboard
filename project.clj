(defproject lightboard "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :min-lein-version "2.0.0"
  :main lightboard.main
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/tools.cli "0.2.2"]
                 [org.clojure/tools.logging "0.2.6"]
                 [log4j "1.2.17" :exclusions [javax.mail/mail
                                              javax.jms/jms
                                              com.sun.jdmk/jmxtools
                                              com.sun.jmx/jmxri]]
                 [compojure "1.3.1"]
                 ;[ring/ring-defaults "0.1.2"]
                 [ring-server "0.4.0"]
                 [http-kit "2.1.18"]
                 [clj-wamp "1.0.0-rc1"]
                 ]
  :profiles {:dev {:resource-paths ["resources-dev"]}}
  ;:plugins [[lein-ring "0.8.13"]]
  ;:ring {:handler lightboard.handler/app}
  ;:profiles
  ;{:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
  ;                      [ring-mock "0.1.5"]]}}

  )
