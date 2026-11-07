# AlgoViz

[![CI](https://github.com/Janat-Yasser/algoviz/actions/workflows/ci.yml/badge.svg)](https://github.com/Janat-Yasser/algoviz/actions/workflows/ci.yml)

Sorting, pathfinding and binary search trees, animated one step at a time. You see the code line doing each step, a counter for every comparison and swap, and you can hear them work if you turn the sound on.

**[Open the live demo →](https://janat-yasser.github.io/algoviz/)** It runs in your browser, with nothing to install.

![Four sorts racing on the same 40 numbers: merge sort finishes first, bubble sort last](docs/race.gif)

## Five experiments to run

**1. Does quick sort always win?**
Open the [race between insertion sort and quick sort](https://janat-yasser.github.io/algoviz/race/?algos=insertion,quick) and set the input to *Nearly sorted*. Insertion sort finishes first because it barely has to move anything. Now try *Reversed*: quick sort takes its pivot from the last element, so it falls to its O(n²) worst case.

**2. What does O(n log n) sound like?**
In [merge sort](https://janat-yasser.github.io/algoviz/sorting/merge/), click the **Sound off** button to switch sound on, then play. Each compared bar plays a pitch that rises with its value. Merges climb like ladders; [heap sort](https://janat-yasser.github.io/algoviz/sorting/heap/) sounds like repeated sift-downs. A finished array ends on a rising sweep.

**3. Which search explores least?**
On [pathfinding](https://janat-yasser.github.io/algoviz/pathfinding/), draw a few walls and press *Compare all four*. BFS, DFS, Dijkstra and A\* run on your grid, and a table lists the cells each one explored, its path length and whether that path is the shortest. DFS usually finds *a* path, but rarely the shortest.

**4. When does bubble sort finish early?**
Give [bubble sort](https://janat-yasser.github.io/algoviz/sorting/bubble/) a *Nearly sorted* input and step with **→**. It stops after a pass with no swaps, which is why its best case is O(n).

**5. How lopsided can a BST get?**
In [trees](https://janat-yasser.github.io/algoviz/trees/), insert 10, 20, 30, 40, 50 in order. You get a linked list on its side, and a search walks every node. That's the problem AVL and red-black trees solve.

| Sorting bench | Pathfinding, all four compared | Binary search tree |
|---|---|---|
| ![Quick sort mid-run with the partition line highlighted](docs/sorting.png) | ![A* through random walls, with the comparison table](docs/pathfinding.png) | ![A search for 50 lighting the path down the tree](docs/trees.png) |

## Why the animations can be trusted

Each algorithm in `public/js/algorithms/` is a pure function. It runs to completion on the input and returns the list of every step it took: which bars it compared, what it swapped, the line of code involved. The page only plays that list back. That has three consequences:

- **Pause, step and speed changes can't desync anything.** The player just moves an index through the list.
- **The race is fair.** Every lane gets the same array and advances one recorded operation per tick, so the finishing order *is* the operation count.
- **The tests check the real algorithms** without a browser. Every sort ends sorted with nothing lost, BFS, Dijkstra and A\* agree on shortest paths, and the BST keeps its ordering.

## Run it locally

```bash
npm install
npm start          # http://localhost:3000
npm test           # 16 tests
npm run build:static   # the GitHub Pages version, in dist/
```

The static build has every page rendered by the real Express app, with relative links, so it works under `/algoviz/`. On the sorting page, **Space** plays and pauses, **→** steps and **R** gives new numbers.

## Notes

- **Design:** a dark graphite bench, so the algorithm's colours are the only bright thing on screen. Amber means comparing, red swapping, mint placed for good, violet the pivot. Type is Space Grotesk with JetBrains Mono, self-hosted (SIL OFL).
- **Next:** AVL and red-black trees, heaps, hash tables, and stepping backwards.

© 2026 Janat Yasser. All rights reserved. See [LICENSE](LICENSE).
