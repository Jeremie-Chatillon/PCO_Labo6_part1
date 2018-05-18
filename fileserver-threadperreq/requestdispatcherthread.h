#ifndef REQUESTDISPATCHERTHREAD_H
#define REQUESTDISPATCHERTHREAD_H

#include <QObject>
#include <QByteArray>
#include <QMap>
#include <QString>
#include <QThread>
#include <QDebug>

#include "responsedispatcherthread.h"
#include "response.h"
#include "abstractbuffer.h"
#include "requestworker.h"

class RequestDispatcherThread : public QThread
{
public:
    RequestDispatcherThread(AbstractBuffer<Request>* requests, AbstractBuffer<Response>* responses, bool m_debug)
        : requests(requests),
          responses(responses),
          m_debug(m_debug)
    {}


    void run() Q_DECL_OVERRIDE {
        while(true){
            Request r = requests->get();
            RequestWorker* rw = new RequestWorker(r, responses, m_debug);
            connect(rw, &RequestWorker::finished, rw, &QObject::deleteLater);
            rw->start();

            if(m_debug)
                qDebug() << "Request send to be handle";
        }

    }


private:

    QMap<QString, QWebSocket *> clients;

    AbstractBuffer<Request>* requests;
    AbstractBuffer<Response>* responses;

    bool m_debug;


};

#endif // REQUESTDISPATCHERTHREAD_H
