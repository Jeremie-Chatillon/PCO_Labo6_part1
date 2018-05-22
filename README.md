# PCO Labo serveur part 1
Par J.Châtillon, J.Smith

## Implémentation

Pour la première partie de ce laboratoire, nous avons décidé d'utiliser les *QSemaphore*.

Nous avons aussi choisit de coder nos classes seulement dans des fichier .h pour simplifier la lisibilité du code.

Nous avons choisit de inialiser toutes les variables de nos classes utilisant des threads par le  constructeur car ces variables ne vont pas changer.	

### FifoBuff

Pour le contener, nous avons créé la classe *FifoBuff* qui hérite de la classe *AbstracteBuffer*. Elle a pour but de faire un tampon bloquant sans taille définie. Pour la liste fifo, on utilise une QListe et on ajoute des nouveaux items à la fin(*put()*) et on retire les items au début (*get()*). La fonction *get()* est bloquante tant qu'il n'y a pas d'items dans la liste (utilisation de la *QSemaphore wait*).  L'appelle de la méthode *put()* libère cette sémaphore. Nous avons aussi utilisé une autre *QSeamphore* comme mutex pour bloquer la lecture et l'écriture dans la liste.

### Gestion des requêtes

Quand le serveur reçoit une requête, il va la placer dans le buffer de requête (*.put()*). Puis le *RequestDispatcherThread*, récupère cette requête (*.get()*) et va créer un *WorkerTread* pour la traiter celle-ci. Une fois la requête traiter, on obtient une *Response* qui est placée dans son buffer. 

#### RequestDispatcherThread

Cette classe héritant de QThread à pour unique but de lire un buffer afin de pouvoir créer des *WorkerThread* à chacune des nouvelles requêtes (sa méthode *run()*). Il faut garder une reference sur les threads pour pouvoir les *delete* quand ils ont finis leur travail. 	Nous avons arbitrairement choisit de *delete* ces threads une fois qu'il y en a plus de 50 lancé en même temps (avec la méthode *deleteFinishedRequest*).  Le destructeur attends que tous les threads aient fini leur travaille avant de continuer (*finishAndDeleteRequest()*). Comme la lecture dans le buf est bloquante, on peut faire une boucle *while(true)* sans faire d'attente avtive (elle sera bloquée tant que le buffer est vide).

#### WorkerTread

Classe  héritant de QThread pemettant de traiter des requêtes en réponses et de les placer dans un buffer de réponses.

## Test:

Nous avons fait des tests avec un chronomètre pour les deux serveurs avec shakespeare.txt. Les temps sont approximatif et nous avons fait qu'une seule prise par valeur(pas de moyenne des temps pour n executions).

| Serveur                   | Nombre de requêtes | Temps[s]    |
| ------------------------- | ------------------ | ----------- |
| Serveur normal            | 100                | Plus de 180 |
| Serveur avec threads (P1) | 100                | 43          |

Pour le serveur normal, j'ai pas attendu qu'il ait términé car il prennait beaucoup trop de temps. Une seule requête peut prendre 10 à 15 secondes. Le serveur avec threads est donc beaucoup plus éfficace.

## Questions

```
Comparez la performance de cette version concurrente avec celle de la version de base. Constatez-vous une amélioration ?
```



```
Que se passe-t-il lorsqu’on lance un nombre de requêtes très important (par ex. 10’000), et comment l’expliquez-vous ?
```

Le serveur crash. Il y a un thread créé par requêtes => 10'00 threads sont créé dynamiquement ce qui est beaucoup trop grand. Ils ont comme seul but de traiter une requête et sont détruit. L'allocation/désallocation mémoire est couteuse  Et aussi, vu qu'il n'y a pas de taille pour le buffer, la mémoire explose. 

```
Comment pourrait-on protéger le serveur de cet effet néfaste ?
```

Il faudrait créer un nombre constant de thread ou bien faire un ThreadPool. Il est aussi possible d'établire un cash pour les requêtes.