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

/**
 * @brief The RequestDispatcherThread class
 * Classe qui attends des requêtes et qui les envoient se faire traiter dans
 *  des worker threads
 */
class RequestDispatcherThread : public QThread
{
public:
    RequestDispatcherThread(AbstractBuffer<Request>* requests,
                            AbstractBuffer<Response>* responses,
                            bool m_debug)
        : workers(new QList<RequestWorker*>()),
          requests(requests),
          responses(responses),
          m_debug(m_debug),
          nbRequest(0)
    {}

    /**
     * @brief run
     * Boucle infinie qui écoute un buffer de requêtes et crée des workerThreads
     */
    void run() Q_DECL_OVERRIDE {
        while(true){
            Request r = requests->get();
            RequestWorker* rw = new RequestWorker(r, responses, m_debug);

            workers->append(rw);
            rw->start();

            if(m_debug)
                qDebug() << "Request send to be handle";

            // Nettoie le tableau de references
            if(++nbRequest <= MAX_REQUEST)
                deleteFinishedRequest();

        }

    }

    /**
     * Attend la fin de tout les thread worker et delete.
     **/
    ~RequestDispatcherThread(){
        finishAndDeleteRequest();
        delete workers;
    }

private:

    /**
     * @brief deleteFinishedRequest
     *
     */
    void deleteFinishedRequest(){
        for(auto i = workers->begin(); i != workers->end();){
            if((*i)->isFinished()){
                delete *i;
                i = workers->erase(i);
                nbRequest--;
            } else {
               ++i;
            }
        }
    }

    /**
     * @brief finishAndDeleteRequest
     * Attends la fin de tout les enfants et les delete
     */
    void finishAndDeleteRequest(){
        for(auto i = workers->begin(); i != workers->end();){
            (*i)->wait();
            delete *i;
            i = workers->erase(i);
        }
    }

    QList<RequestWorker*>* workers;
    AbstractBuffer<Request>* requests;
    AbstractBuffer<Response>* responses;

    bool m_debug;

    // nombre de requêtes courrants
    int nbRequest;
    // nombre de requête maximum avant de nettoyer le buffer
    const int MAX_REQUEST = 50;
};

#endif // REQUESTDISPATCHERTHREAD_H
