import { LESSONS } from "./lessons-data.js";

export const VISUALIZERS = [
    {
        id: "bubble-sort",
        title: "Bubble Sort",
        topic: "sorting-search",
        engine: "bar-sort",
        algo: "bubble",
        description: "So sánh hai phần tử kề nhau và đổi chỗ nếu sai thứ tự. Phần tử lớn nhất \"nổi\" về cuối mỗi vòng.",
        complexity: "O(n²)",
        relatedLessonId: null
    },
    {
        id: "insertion-sort",
        title: "Insertion Sort",
        topic: "sorting-search",
        engine: "bar-sort",
        algo: "insertion",
        description: "Chèn từng phần tử vào đúng vị trí trong phần đã sắp xếp — giống cách sắp xếp bài trên tay.",
        complexity: "O(n²)",
        relatedLessonId: null
    },
    {
        id: "selection-sort",
        title: "Selection Sort",
        topic: "sorting-search",
        engine: "bar-sort",
        algo: "selection",
        description: "Mỗi vòng chọn phần tử nhỏ nhất trong phần chưa sắp xếp và đặt vào vị trí đúng.",
        complexity: "O(n²)",
        relatedLessonId: null
    },
    {
        id: "quick-sort",
        title: "Quick Sort",
        topic: "sorting-search",
        engine: "bar-sort",
        algo: "quick",
        description: "Chọn pivot, chia mảng thành phần nhỏ hơn và lớn hơn pivot, rồi sắp xếp đệ quy.",
        complexity: "O(n log n)",
        relatedLessonId: null
    },
    {
        id: "merge-sort",
        title: "Merge Sort",
        topic: "sorting-search",
        engine: "bar-sort",
        algo: "merge",
        description: "Chia đôi mảng, sắp xếp từng nửa rồi trộn (merge) hai nửa đã sắp xếp.",
        complexity: "O(n log n)",
        relatedLessonId: null
    },
    {
        id: "linear-search",
        title: "Linear Search",
        topic: "sorting-search",
        engine: "linear-search",
        description: "Duyệt tuần tự từng phần tử cho đến khi tìm thấy giá trị cần tìm.",
        complexity: "O(n)",
        relatedLessonId: null
    },
    {
        id: "binary-search",
        title: "Binary Search",
        topic: "sorting-search",
        engine: "binary-search",
        description: "Tìm kiếm nhị phân trên mảng đã sắp xếp — mỗi bước loại bỏ một nửa không gian tìm kiếm.",
        complexity: "O(log n)",
        relatedLessonId: null
    },
    {
        id: "insertion-sort",
        title: "Insertion Sort",
        topic: "sorting",
        engine: "bar-sort",
        algo: "insertion",
        description: "Chèn từng phần tử vào đúng vị trí trong phần đã sắp xếp — giống cách sắp xếp bài trên tay.",
        complexity: "O(n²)",
        relatedLessonId: null
    },
    {
        id: "selection-sort",
        title: "Selection Sort",
        topic: "sorting",
        engine: "bar-sort",
        algo: "selection",
        description: "Mỗi vòng chọn phần tử nhỏ nhất trong phần chưa sắp xếp và đặt vào vị trí đúng.",
        complexity: "O(n²)",
        relatedLessonId: null
    },
    {
        id: "quick-sort",
        title: "Quick Sort",
        topic: "sorting",
        engine: "bar-sort",
        algo: "quick",
        description: "Chọn pivot, chia mảng thành phần nhỏ hơn và lớn hơn pivot, rồi sắp xếp đệ quy.",
        complexity: "O(n log n)",
        relatedLessonId: null
    },
    {
        id: "merge-sort",
        title: "Merge Sort",
        topic: "sorting",
        engine: "bar-sort",
        algo: "merge",
        description: "Chia đôi mảng, sắp xếp từng nửa rồi trộn (merge) hai nửa đã sắp xếp.",
        complexity: "O(n log n)",
        relatedLessonId: null
    },
    {
        id: "linear-search",
        title: "Linear Search",
        topic: "search",
        engine: "linear-search",
        description: "Duyệt tuần tự từng phần tử cho đến khi tìm thấy giá trị cần tìm.",
        complexity: "O(n)",
        relatedLessonId: null
    },
    {
        id: "binary-search",
        title: "Binary Search",
        topic: "search",
        engine: "binary-search",
        description: "Tìm kiếm nhị phân trên mảng đã sắp xếp — mỗi bước loại bỏ một nửa không gian tìm kiếm.",
        complexity: "O(log n)",
        relatedLessonId: null
    },
    {
        id: "bfs",
        title: "BFS Traversal",
        topic: "graph",
        engine: "bfs",
        description: "Duyệt đồ thị theo tầng (Breadth-First Search) — khám phá các đỉnh gần nguồn trước.",
        complexity: "O(V + E)",
        relatedLessonId: "bfs"
    },
    {
        id: "dfs",
        title: "DFS Traversal",
        topic: "graph",
        engine: "dfs",
        description: "Duyệt đồ thị theo chiều sâu (Depth-First Search) — đi sâu nhất có thể trước khi quay lui.",
        complexity: "O(V + E)",
        relatedLessonId: "dfs"
    },
    {
        id: "dijkstra",
        title: "Dijkstra",
        topic: "graph",
        engine: "dijkstra",
        description: "Tìm đường đi ngắn nhất từ đỉnh nguồn trên đồ thị có trọng số không âm.",
        complexity: "O((V+E) log V)",
        relatedLessonId: "dijkstra"
    },
    {
        id: "topo-sort",
        title: "Topological Sort",
        topic: "graph",
        engine: "topo-sort",
        description: "Sắp xếp topo trên DAG bằng thuật toán Kahn (BFS in-degree).",
        complexity: "O(V + E)",
        relatedLessonId: "topo-sort"
    },
    {
        id: "knapsack",
        title: "0/1 Knapsack (DP)",
        topic: "dp",
        engine: "knapsack",
        description: "Bảng DP cho bài toán cặp sách: chọn vật tối đa hóa giá trị với giới hạn trọng lượng.",
        complexity: "O(n·W)",
        relatedLessonId: "knapsack"
    },
    {
        id: "coin-change",
        title: "Coin Change (DP)",
        topic: "dp",
        engine: "coin-change",
        description: "DP tối thiểu số đồng xu để đổi đúng một số tiền.",
        complexity: "O(n·amount)",
        relatedLessonId: "coin-change"
    },
    {
        id: "lis",
        title: "Longest Increasing Subsequence",
        topic: "dp",
        engine: "lis",
        description: "DP O(n²) tìm độ dài dãy con tăng dài nhất.",
        complexity: "O(n²)",
        relatedLessonId: "lis"
    },
    {
        id: "stack",
        title: "Stack (LIFO)",
        topic: "data-structure",
        engine: "stack",
        description: "Cấu trúc ngăn xếp — vào sau ra trước (Last In, First Out).",
        complexity: "O(1)",
        relatedLessonId: null
    },
    {
        id: "queue",
        title: "Queue (FIFO)",
        topic: "data-structure",
        engine: "queue",
        description: "Hàng đợi — vào trước ra trước (First In, First Out).",
        complexity: "O(1)",
        relatedLessonId: null
    },
    {
        id: "tree-bfs",
        title: "Tree BFS (Level Order)",
        topic: "tree",
        engine: "tree-bfs",
        description: "Duyệt cây nhị phân theo tầng — từ gốc xuống từng level.",
        complexity: "O(n)",
        relatedLessonId: "tree-traversal"
    }
];

export const TOPIC_LABELS = {
    graph: "Đồ thị",
    dp: "Quy hoạch động",
    "data-structure": "Cấu trúc dữ liệu",
    tree: "Cây",
    "sorting-search": "Sắp xếp và Tìm kiếm",
    recursion: "Đệ quy",
    greedy: "Tham lam",
    math: "Toán",
    string: "Xâu",
    other: "Khác"
};

export function getVisualizerById(id) {
    return VISUALIZERS.find((v) => v.id === id) || null;
}

export function getVisualizerByLessonId(lessonId) {
    return VISUALIZERS.find((v) => v.relatedLessonId === lessonId) || null;
}

export function getVisualizerForProblem(problemId) {
    const lesson = LESSONS.find((l) => String(l.relatedProblemId) === String(problemId));
    return lesson ? getVisualizerByLessonId(lesson.id) : null;
}
