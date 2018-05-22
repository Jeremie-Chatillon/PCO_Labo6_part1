#ifndef REQUESTWORKER_H
#define REQUESTWORKER_H



#include "request.h"
#include "abstractbuffer.h"
#include "response.h"
#include <QThread>
#include <QWebSocket>
#include <QDebug>
#include <QString>

#include "abstractbuffer.h"
#include "requesthandler.h"

/**
 * @brief The RequestWorker class
 * Classe traitant une Requête pour obtenir une réponse et la place
 *  dans un buffer.
 * Le thread est términé une fois que le message est traité
 */
class RequestWorker : public QThread
{



public:
    RequestWorker(Request req, AbstractBuffer<Response>* responses, bool m_debug)
        : req(req),
          responses(responses),
          m_debug(m_debug)
    {}

    /**
     * @brief run
     * traitant une Requête pour obtenir une réponse et la place
     *  dans un buffer.
     */
    void run() Q_DECL_OVERRIDE {
        RequestHandler rh(req, m_debug);
        responses->put(rh.handle());
    }


private:
    Request req;
    AbstractBuffer<Response>* responses;

    bool m_debug;

};

#endif // REQUESTWORKER_H
