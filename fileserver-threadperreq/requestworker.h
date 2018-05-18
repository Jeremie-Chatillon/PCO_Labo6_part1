#ifndef REQUESTWORKER_H
#define REQUESTWORKER_H



#include "request.h"
#include "abstractbuffer.h"
#include "response.h"
#include "filereader.h"
#include <QThread>
#include <QWebSocket>
#include <QDebug>
#include <QString>

#include "abstractbuffer.h"
class RequestWorker : public QThread
{



public:
    RequestWorker(Request req, AbstractBuffer<Response>* responses, bool m_debug)
        : req(req),
          responses(responses),
          m_debug(m_debug)
    {}

    void run() Q_DECL_OVERRIDE {
        QWebSocket *pClient = qobject_cast<QWebSocket *>(sender());

        QString message = req.getFilePath();

        if (m_debug)
            qDebug() << "Message treated:" << message;
        //if (pClient) {
            FileReader reader(message, m_debug);
            if (reader.fileExists()) {
                Response r(req, reader.readAll());

                responses->put(r);

                //pClient->sendTextMessage(r.toJson());
                if (m_debug) {
                    QString json = r.toJson();
                    json.truncate(200);
                    qDebug() << "Sending response:" << json;
                }
            } else {
                Response r(req, "File not found!");

                responses->put(r);
                //pClient->sendTextMessage(r.toJson());
                if (m_debug)
                    qDebug() << "Sending response:" << r.toJson();
            }
        //}
    }


private:
    Request req;
    AbstractBuffer<Response>* responses;

    bool m_debug;

};

#endif // REQUESTWORKER_H
