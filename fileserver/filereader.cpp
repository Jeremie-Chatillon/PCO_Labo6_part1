#include "filereader.h"
#include <QDir>
#include <QFile>
#include <QtCore/QDebug>

FileReader::FileReader(const QString path, bool debug): debug(debug) {
    QString expandedPath = path;
    if (path.startsWith("~/")) {
         expandedPath = expandedPath.replace(0, 1, QDir::homePath());
    }
    info = QFileInfo(expandedPath);
}


bool FileReader::fileExists()
{
    return info.exists();
}

int FileReader::byteCount()
{
    return info.size();
}

QString FileReader::readAll()
{
    QString path = info.absoluteFilePath();

    if (debug) qDebug() << "Attempting to read file with path:" << path;
    QFile file(path);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
        return "read failure";
    QTextStream in(&file);

    this->simulateHeavyEncoding();
    return in.readAll();
}

void FileReader::simulateHeavyEncoding() {
    int i = 0;
    while(i < 1000000000)
        i++;
}

