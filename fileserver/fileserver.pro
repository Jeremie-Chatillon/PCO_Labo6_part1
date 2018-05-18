QT       += core websockets
QT       -= gui

TARGET = fileserver
CONFIG   += console
CONFIG   -= app_bundle

TEMPLATE = app

SOURCES += \
    main.cpp \
    fileserver.cpp \
    filereader.cpp

HEADERS += \
    fileserver.h \
    filereader.h \
    response.h

EXAMPLE_FILES += fileclient.html

