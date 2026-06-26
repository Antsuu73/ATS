export const PROBLEMS = [
    {
        id: "1",
        title: "BFS Shortest Path",
        topic: "graph",
        tag: "BFS",
        difficulty: "Easy",
        rating: 800,
        description: "Cho đồ thị vô hướng có n đỉnh và m cạnh, cùng hai đỉnh s và t. Tìm số cạnh ít nhất từ s đến t. Nếu không có đường đi, in -1.",
        examples: [
            { input: "n=5, edges=[[1,2],[2,3],[1,4]], s=1, t=3", output: "2" },
            { input: "n=3, edges=[[1,2]], s=1, t=3", output: "-1" }
        ],
        constraints: "1 ≤ n ≤ 10^5, 0 ≤ m ≤ 2·10^5"
    },
    {
        id: "2",
        title: "DFS Connected Components",
        topic: "graph",
        tag: "DFS",
        difficulty: "Easy",
        rating: 850,
        description: "Đếm số thành phần liên thông trong đồ thị vô hướng gồm n đỉnh.",
        examples: [
            { input: "n=5, edges=[[1,2],[3,4]]", output: "3" }
        ],
        constraints: "1 ≤ n ≤ 10^5"
    },
    {
        id: "3",
        title: "Dijkstra Minimum Cost",
        topic: "graph",
        tag: "Dijkstra",
        difficulty: "Medium",
        rating: 1200,
        description: "Tìm đường đi ngắn nhất từ đỉnh 1 đến đỉnh n trong đồ thị có trọng số dương.",
        examples: [
            { input: "n=4, edges=[[1,2,1],[2,3,2],[1,3,5]]", output: "3" }
        ],
        constraints: "1 ≤ n ≤ 10^5, trọng số ≤ 10^9"
    },
    {
        id: "4",
        title: "Topological Sort",
        topic: "graph",
        tag: "Graph",
        difficulty: "Medium",
        rating: 1300,
        description: "Cho DAG với n đỉnh. In một thứ tự topo hợp lệ. Nếu có chu trình, in IMPOSSIBLE.",
        examples: [
            { input: "n=4, edges=[[1,2],[1,3],[3,4]]", output: "1 3 4 2" }
        ],
        constraints: "1 ≤ n ≤ 10^5"
    },
    {
        id: "5",
        title: "0/1 Knapsack",
        topic: "dp",
        tag: "Knapsack",
        difficulty: "Easy",
        rating: 900,
        description: "Có n vật với trọng lượng w[i] và giá trị v[i]. Chọn tổng trọng lượng ≤ W để tối đa hóa giá trị.",
        examples: [
            { input: "n=3, W=5, w=[2,3,4], v=[3,4,5]", output: "7" }
        ],
        constraints: "1 ≤ n ≤ 100, 1 ≤ W ≤ 10^4"
    },
    {
        id: "6",
        title: "Longest Increasing Subsequence",
        topic: "dp",
        tag: "LIS",
        difficulty: "Medium",
        rating: 1100,
        description: "Tìm độ dài dãy con tăng dài nhất của mảng a gồm n phần tử.",
        examples: [
            { input: "a=[10,9,2,5,3,7,101,18]", output: "4" }
        ],
        constraints: "1 ≤ n ≤ 2500"
    },
    {
        id: "7",
        title: "Coin Change",
        topic: "dp",
        tag: "DP",
        difficulty: "Medium",
        rating: 1150,
        description: "Có vô hạn mỗi loại đồng xu. Tìm số đồng xu ít nhất để đổi đúng số tiền amount.",
        examples: [
            { input: "coins=[1,2,5], amount=11", output: "3" }
        ],
        constraints: "1 ≤ amount ≤ 10^4"
    },
    {
        id: "8",
        title: "Binary Tree Maximum Depth",
        topic: "tree",
        tag: "Tree",
        difficulty: "Easy",
        rating: 750,
        description: "Tính độ sâu tối đa của cây nhị phân cho trước.",
        examples: [
            { input: "root=[3,9,20,null,null,15,7]", output: "3" }
        ],
        constraints: "Số nút ≤ 10^4"
    },
    {
        id: "9",
        title: "Lowest Common Ancestor",
        topic: "tree",
        tag: "LCA",
        difficulty: "Medium",
        rating: 1400,
        description: "Cho cây nhị phân và hai nút p, q. Tìm tổ tiên chung gần nhất của p và q.",
        examples: [
            { input: "root=[3,5,1,6,2,0,8], p=5, q=1", output: "3" }
        ],
        constraints: "Số nút ≤ 10^5"
    },
    {
        id: "10",
        title: "Diameter of Binary Tree",
        topic: "tree",
        tag: "Tree",
        difficulty: "Medium",
        rating: 1250,
        description: "Tìm đường kính của cây nhị phân (độ dài đường đi dài nhất giữa hai nút).",
        examples: [
            { input: "root=[1,2,3,4,5]", output: "3" }
        ],
        constraints: "Số nút ≤ 10^4"
    },

];

export const TOPIC_LABELS = {
    graph: "Graph",
    dp: "Dynamic Programming",
    tree: "Tree",
};

export const DIFFICULTY_ORDER = { Easy: 1, Medium: 2, Hard: 3 };

export function getProblemById(id) {
    return PROBLEMS.find((p) => String(p.id) === String(id)) || null;
}

export function getProblemsByTopic(topic) {
    if (!topic || topic === "all") return [...PROBLEMS];
    return PROBLEMS.filter((p) => p.topic === topic);
}
