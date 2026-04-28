export class Node {
    constructor(id, payload) {
        this.id = id;
        this.payload = payload;
        this.next = null;
        this.prev = null;
    }
}

export class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    insert(id, payload) {
        const newNode = new Node(id, payload);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        this.size++;
        return newNode;
    }

    find(id) {
        let current = this.head;
        while (current) {
            if (current.id === id) return current;
            current = current.next;
        }
        return null;
    }

    findWhere(key, value) {
        let current = this.head;
        while (current) {
            if (current.payload[key] === value) return current;
            current = current.next;
        }
        return null;
    }

    update(id, newPayload) {
        let targetNode = this.find(id);
        if (targetNode) {
            targetNode.payload = { ...targetNode.payload, ...newPayload };
            return true;
        }
        return false;
    }

    remove(id) {
        let current = this.head;
        while (current) {
            if (current.id === id) {
                if (current.prev) current.prev.next = current.next;
                else this.head = current.next;

                if (current.next) current.next.prev = current.prev;
                else this.tail = current.prev;

                current.next = null;
                current.prev = null;
                this.size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push({ id: current.id, ...current.payload });
            current = current.next;
        }
        return result;
    }
}