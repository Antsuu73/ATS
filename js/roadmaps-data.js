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
    }
];

export function getRoadmapById(id) {
    return ROADMAPS.find((r) => r.id === id) || null;
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
