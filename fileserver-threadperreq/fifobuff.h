#ifndef FIFOBUF_H
#define FIFOBUF_H

#include "abstractbuffer.h"

#include <QLinkedList>
#include <QSemaphore>


template<typename T>
class fifoBuf: public AbstractBuffer<T> {
private:
    QLinkedList<T>* list;
    QSemaphore* wait;
    QSemaphore* mutex;
public:
    fifoBuf()
        :list(new QLinkedList<T>()), wait(new QSemaphore()), mutex(new QSemaphore(1))
    {}

    void put(T item){
        mutex->acquire();
        list->push_back(item);
        wait->release();
        mutex->release();
    }

    T get(){
        wait->acquire();
        mutex->acquire();
        T ret = list->front();
        list->pop_front();
        mutex->release();

        return ret;

    }

    ~fifoBuf(){
        delete list;
    }

};


#endif // FIFOBUF_H
