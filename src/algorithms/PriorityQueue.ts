/**
 * Generic Binary Min-Heap Priority Queue implementation for Dijkstra's Algorithm.
 * Guarantees O(log N) push and pop operations.
 */
export interface PriorityQueueNode<T> {
  item: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PriorityQueueNode<T>[] = [];

  constructor() {
    this.heap = [];
  }

  /**
   * Insert an element with a given priority (lower number = higher priority).
   */
  public push(item: T, priority: number): void {
    const node: PriorityQueueNode<T> = { item, priority };
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Extract and return the element with the lowest priority value.
   */
  public pop(): PriorityQueueNode<T> | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return root;
  }

  /**
   * Look at the root element without removing it.
   */
  public peek(): PriorityQueueNode<T> | undefined {
    return this.heap[0];
  }

  /**
   * Returns current count of elements in the heap.
   */
  public size(): number {
    return this.heap.length;
  }

  /**
   * Returns true if heap has no elements.
   */
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Clear the priority queue.
   */
  public clear(): void {
    this.heap = [];
  }

  /**
   * Move an element up until heap property is restored.
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) {
        break;
      }
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Move an element down until heap property is restored.
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < length &&
        this.heap[leftChild].priority < this.heap[smallest].priority
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        this.heap[rightChild].priority < this.heap[smallest].priority
      ) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  /**
   * Swap two nodes in the heap array.
   */
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
