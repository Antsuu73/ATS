import { getVisualizerByLessonId } from "./visualizers-data.js";

export const ROADMAPS = [
    {
        id: "graph",
        title: "Graph Theory",
        level: "Beginner",
        levelClass: "green-bg",
        topic: "graph",
        description: "Học BFS, DFS, Dijkstra và Topological Sort qua lý thuyết ngắn gọn rồi luyện bài.",
        skills: ["BFS", "DFS", "Dijkstra", "Topological Sort"],
        steps: [
            {
                type: "learn",
                title: "Breadth-First Search (BFS)",
                lessonId: "bfs",
                content: "BFS duyệt đồ thị theo tầng từ một đỉnh nguồn. Dùng hàng đợi (queue) để luôn mở rộng các đỉnh gần nguồn trước. Phù hợp tìm đường đi ngắn nhất trên đồ thị không trọng số."
            },
            {
                type: "practice",
                title: "BFS Shortest Path",
                problemId: "1",
                content: "Áp dụng BFS để tìm số cạnh ít nhất giữa hai đỉnh."
            },
            {
                type: "learn",
                title: "Depth-First Search (DFS)",
                lessonId: "dfs",
                content: "DFS đi sâu nhất có thể trước khi quay lui. Dùng đệ quy hoặc stack. Thường dùng để đếm thành phần liên thông, phát hiện chu trình, hoặc topo sort."
            },
            {
                type: "practice",
                title: "DFS Connected Components",
                problemId: "2",
                content: "Dùng DFS để đếm số thành phần liên thông."
            },
            {
                type: "learn",
                title: "Dijkstra",
                lessonId: "dijkstra",
                content: "Thuật toán tìm đường đi ngắn nhất trên đồ thị có trọng số không âm. Dùng priority queue để luôn chọn đỉnh có khoảng cách nhỏ nhất tiếp theo."
            },
            {
                type: "practice",
                title: "Dijkstra Minimum Cost",
                problemId: "3",
                content: "Tìm chi phí nhỏ nhất từ đỉnh 1 đến đỉnh n."
            },
            {
                type: "learn",
                title: "Topological Sort",
                lessonId: "topo-sort",
                content: "Sắp xếp các đỉnh của DAG sao cho mọi cạnh u→v đều có u đứng trước v. Có thể làm bằng DFS hoặc Kahn (BFS in-degree)."
            },
            {
                type: "practice",
                title: "Topological Sort",
                problemId: "4",
                content: "In thứ tự topo hợp lệ hoặc báo IMPOSSIBLE nếu có chu trình."
            }
        ]
    },
    {
        id: "dp",
        title: "Dynamic Programming",
        level: "Intermediate",
        levelClass: "blue-bg",
        topic: "dp",
        description: "Nắm tư duy DP: trạng thái, chuyển tiếp, tối ưu con. Luyện Knapsack, LIS và Coin Change.",
        skills: ["Knapsack", "LIS", "Coin Change"],
        steps: [
            {
                type: "learn",
                title: "Tư duy Dynamic Programming",
                lessonId: "dp-intro",
                content: "DP chia bài toán lớn thành các bài con chồng lên nhau. Xác định trạng thái dp[i], công thức chuyển tiếp, và thứ tự tính để tránh tính lại."
            },
            {
                type: "learn",
                title: "0/1 Knapsack",
                lessonId: "knapsack",
                content: "Mỗi vật chỉ chọn hoặc không chọn. dp[w] = max(dp[w], dp[w-weight[i]] + value[i]). Duyệt trọng lượng từ lớn đến nhỏ khi cập nhật."
            },
            {
                type: "practice",
                title: "0/1 Knapsack",
                problemId: "5",
                content: "Chọn vật tối đa hóa giá trị với giới hạn trọng lượng W."
            },
            {
                type: "learn",
                title: "Longest Increasing Subsequence",
                lessonId: "lis",
                content: "LIS có thể giải O(n²) bằng DP hoặc O(n log n) bằng binary search trên mảng tails. dp[i] = độ dài LIS kết thúc tại i."
            },
            {
                type: "practice",
                title: "Longest Increasing Subsequence",
                problemId: "6",
                content: "Tìm độ dài dãy con tăng dài nhất."
            },
            {
                type: "learn",
                title: "Coin Change",
                lessonId: "coin-change",
                content: "Bài toán tối ưu số lượng: dp[amount] = min(dp[amount], dp[amount-coin] + 1). Khởi tạo dp[0]=0, các giá trị khác là vô cực."
            },
            {
                type: "practice",
                title: "Coin Change",
                problemId: "7",
                content: "Tìm số đồng xu ít nhất để đổi đúng amount."
            }
        ]
    },
    {
        id: "tree",
        title: "Tree Algorithms",
        level: "Advanced",
        levelClass: "red-bg",
        topic: "tree",
        description: "Làm quen duyệt cây, LCA và đường kính cây nhị phân qua bài tập có hệ thống.",
        skills: ["Tree Traversal", "LCA", "Diameter"],
        steps: [
            {
                type: "learn",
                title: "Duyệt cây nhị phân",
                lessonId: "tree-traversal",
                content: "Preorder, inorder, postorder và BFS theo tầng. Độ sâu cây = 1 + max(độ sâu con trái, độ sâu con phải). Base case: nút null có độ sâu 0."
            },
            {
                type: "practice",
                title: "Binary Tree Maximum Depth",
                problemId: "8",
                content: "Tính độ sâu tối đa của cây nhị phân."
            },
            {
                type: "learn",
                title: "Lowest Common Ancestor (LCA)",
                lessonId: "lca",
                content: "LCA của p và q là tổ tiên chung sâu nhất. Có thể giải bằng DFS: nếu nút hiện tại là p hoặc q thì trả về nó; nếu hai nhánh trả về khác null thì nút hiện tại là LCA."
            },
            {
                type: "practice",
                title: "Lowest Common Ancestor",
                problemId: "9",
                content: "Tìm LCA của hai nút p và q trong cây nhị phân."
            },
            {
                type: "learn",
                title: "Đường kính cây",
                lessonId: "tree-diameter",
                content: "Đường kính = độ dài đường đi dài nhất. Với mỗi nút, đường đi dài nhất đi qua nút đó = 1 + top2 độ sâu của các nhánh con. Cập nhật đường kính toàn cây khi duyệt."
            },
            {
                type: "practice",
                title: "Diameter of Binary Tree",
                problemId: "10",
                content: "Tìm đường kính của cây nhị phân."
            }
        ]
    },
    {
        id: "recursion",
        title: "Đệ quy và Chia để trị",
        level: "Beginner",
        levelClass: "green-bg",
        topic: "recursion",
        description: "Làm chủ tư duy đệ quy: base case, recursive case, memoization.",
        skills: ["Tower of Hanoi", "Fibonacci"],
        steps: [
            {
                type: "learn",
                title: "Tư duy Đệ quy",
                lessonId: "recursion-intro",
                content: "Đệ quy chia bài toán thành bài con nhỏ hơn. Cần base case để dừng và recursive case để tiếp tục."
            },
            {
                type: "practice",
                title: "Tower of Hanoi",
                problemId: "11",
                content: "Chuyển n đĩa theo quy tắc với số bước tối thiểu."
            }
        ]
    },
    {
        id: "data-structure",
        title: "Cấu trúc dữ liệu cơ bản",
        level: "Beginner",
        levelClass: "green-bg",
        topic: "data-structure",
        description: "Học Stack và Queue — hai cấu trúc nền tảng dùng trong thuật toán.",
        skills: ["Stack", "Queue", "Parentheses"],
        steps: [
            {
                type: "learn",
                title: "Stack và Queue",
                lessonId: "stack-queue",
                content: "Stack LIFO và Queue FIFO là hai cấu trúc dữ liệu cực kỳ phổ biến."
            },
            {
                type: "practice",
                title: "Valid Parentheses",
                problemId: "12",
                content: "Kiểm tra chuỗi ngoặc có hợp lệ không bằng Stack."
            }
        ]
    },
    {
        id: "sorting-search",
        title: "Sắp xếp và Tìm kiếm",
        level: "Beginner",
        levelClass: "green-bg",
        topic: "sorting-search",
        description: "Nắm vững các thuật toán sắp xếp cơ bản và tìm kiếm nhị phân.",
        skills: ["Bubble Sort", "Binary Search"],
        steps: [
            {
                type: "learn",
                title: "Binary Search",
                lessonId: "binary-search",
                content: "Tìm kiếm nhị phân trên mảng đã sắp xếp — mỗi bước loại bỏ một nửa."
            },
            {
                type: "practice",
                title: "Binary Search",
                problemId: "13",
                content: "Triển khai tìm kiếm nhị phân."
            }
        ]
    },
    {
        id: "greedy",
        title: "Thuật toán Tham lam",
        level: "Intermediate",
        levelClass: "blue-bg",
        topic: "greedy",
        description: "Chọn phương án tối ưu cục bộ tại mỗi bước — không hối tiếc.",
        skills: ["Fractional Knapsack", "Activity Selection"],
        steps: [
            {
                type: "learn",
                title: "Tư duy Tham lam",
                lessonId: "greedy-intro",
                content: "Greedy chọn giải pháp tốt nhất tại mỗi bước. Đúng khi bài toán có tính chất tối ưu cục bộ dẫn đến toàn cục."
            },
            {
                type: "practice",
                title: "Fractional Knapsack",
                problemId: "14",
                content: "Chọn vật để tổng giá trị lớn nhất với giới hạn trọng lượng W."
            }
        ]
    },
    {
        id: "math",
        title: "Toán trong Lập trình",
        level: "Intermediate",
        levelClass: "blue-bg",
        topic: "math",
        description: "Số nguyên tố, modulo, và các kỹ thuật toán cơ bản.",
        skills: ["Số nguyên tố", "Sàng Eratosthenes"],
        steps: [
            {
                type: "learn",
                title: "Số nguyên tố và modulo",
                lessonId: "prime-sieve",
                content: "Kiểm tra số nguyên tố O(sqrt(n)) và sàng Eratosthenes O(n log log n)."
            },
            {
                type: "practice",
                title: "Số nguyên tố",
                problemId: "15",
                content: "Kiểm tra n có phải số nguyên tố."
            }
        ]
    },
    {
        id: "string",
        title: "Xử lý Xâu",
        level: "Intermediate",
        levelClass: "blue-bg",
        topic: "string",
        description: "Palindrome, LCS và các kỹ thuật xử lý xâu phổ biến.",
        skills: ["Palindrome", "LCS"],
        steps: [
            {
                type: "learn",
                title: "Xâu con chung dài nhất (LCS)",
                lessonId: "lcs",
                content: "LCS tìm dãy ký tự chung dài nhất giữa hai xâu bằng DP 2D."
            },
            {
                type: "practice",
                title: "Palindrome",
                problemId: "16",
                content: "Kiểm tra xâu đối xứng (palindrome)."
            }
        ]
    }
];

export function getRoadmapById(id) {
    const roadmap = ROADMAPS.find((r) => r.id === id);
    if (!roadmap) return null;

    return {
        ...roadmap,
        steps: expandStepsWithVisualizers(roadmap.steps)
    };
}

function expandStepsWithVisualizers(steps) {
    const expanded = [];

    steps.forEach((step) => {
        expanded.push(step);

        if (step.type !== "learn" || !step.lessonId) return;

        const viz = getVisualizerByLessonId(step.lessonId);
        if (!viz) return;

        expanded.push({
            type: "visualize",
            title: `Mô phỏng: ${viz.title}`,
            visualizerId: viz.id,
            content: `Xem thuật toán chạy trực quan — ${viz.description}`
        });
    });

    return expanded;
}

export function getPracticeSteps(roadmap) {
    return roadmap.steps.filter((s) => s.type === "practice");
}

export function computeRoadmapProgress(roadmap, solvedIds) {
    const practice = getPracticeSteps(roadmap);
    if (!practice.length) return 0;

    const solved = practice.filter((s) => solvedIds.has(String(s.problemId))).length;
    return Math.round((solved / practice.length) * 100);
}
