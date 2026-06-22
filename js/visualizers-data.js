export const VISUALIZERS = [
    {
        id: "bubble-sort",
        title: "Bubble Sort",
        topic: "sorting",
        description: "So sánh hai phần tử kề nhau và đổi chỗ nếu sai thứ tự. Phần tử lớn nhất \"nổi\" về cuối mỗi vòng.",
        complexity: "O(n²)",
        relatedLessonId: null
    },
    {
        id: "insertion-sort",
        title: "Insertion Sort",
        topic: "sorting",
        description: "Chèn từng phần tử vào đúng vị trí trong phần đã sắp xếp — giống cách sắp xếp bài trên tay.",
        complexity: "O(n²)",
        relatedLessonId: null
    },
    {
        id: "binary-search",
        title: "Binary Search",
        topic: "search",
        description: "Tìm kiếm nhị phân trên mảng đã sắp xếp — mỗi bước loại bỏ một nửa không gian tìm kiếm.",
        complexity: "O(log n)",
        relatedLessonId: null
    },
    {
        id: "bfs",
        title: "BFS Traversal",
        topic: "graph",
        description: "Duyệt đồ thị theo tầng (Breadth-First Search) — khám phá các đỉnh gần nguồn trước.",
        complexity: "O(V + E)",
        relatedLessonId: "bfs"
    },
    {
        id: "dfs",
        title: "DFS Traversal",
        topic: "graph",
        description: "Duyệt đồ thị theo chiều sâu (Depth-First Search) — đi sâu nhất có thể trước khi quay lui.",
        complexity: "O(V + E)",
        relatedLessonId: "dfs"
    },
    {
        id: "dijkstra",
        title: "Dijkstra",
        topic: "graph",
        description: "Tìm đường đi ngắn nhất từ đỉnh nguồn trên đồ thị có trọng số không âm.",
        complexity: "O((V+E) log V)",
        relatedLessonId: "dijkstra"
    }
];

export const TOPIC_LABELS = {
    sorting: "Sorting",
    search: "Search",
    graph: "Graph"
};

export function getVisualizerById(id) {
    return VISUALIZERS.find((v) => v.id === id) || null;
}
