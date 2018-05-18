#ifndef RESPONSE_H
#define RESPONSE_H

#include <QJsonObject>
#include <QJsonDocument>

class Response {
private:
    QString request;
    QString response;

public:
    Response(const QString request, const QString response): request(request), response(response) {}

    QString toJson() {
        QJsonObject obj;
        obj["request"] = request;
        obj["response"] = response;
        QJsonDocument doc(obj);
        QString strJson(doc.toJson(QJsonDocument::Compact));
        return strJson;
    }
};
#endif // RESPONSE_H
