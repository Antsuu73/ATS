export const LESSONS = [
    {
        id: "bfs",
        title: "Breadth-First Search (BFS)",
        topic: "graph",
        difficulty: "Easy",
        duration: "15 phút",
        summary: "Duyệt đồ thị theo tầng, tìm đường đi ngắn nhất trên đồ thị không trọng số.",
        relatedProblemId: "1",
        roadmapId: "graph",
        sections: [
            {
                title: "BFS là gì?",
                content: "Breadth-First Search (BFS) là thuật toán duyệt đồ thị bắt đầu từ một đỉnh nguồn, khám phá tất cả các đỉnh ở tầng gần trước, rồi mới đến tầng xa hơn. Hình dung như sóng lan tỏa từ tâm ra ngoài."
            },
            {
                title: "Khi nào dùng BFS?",
                content: "• Tìm đường đi ngắn nhất (số cạnh ít nhất) trên đồ thị không trọng số\n• Kiểm tra đồ thị có liên thông không\n• Tìm tầng/level của từng đỉnh\n• Duyệt lưới 2D (maze, flood fill)"
            },
            {
                title: "Cách hoạt động",
                content: "1. Cho đỉnh nguồn vào hàng đợi (queue) và đánh dấu đã thăm\n2. Lấy đỉnh đầu queue ra xử lý\n3. Duyệt tất cả đỉnh kề chưa thăm → cho vào queue và đánh dấu\n4. Lặp đến khi queue rỗng"
            },
            {
                title: "Code mẫu (C++)",
                code: `void bfs(int start) {
    queue<int> q;
    vector<bool> visited(n + 1, false);
    q.push(start);
    visited[start] = true;

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
}`
            },
            {
                title: "Độ phức tạp",
                content: "• Thời gian: O(V + E) với V đỉnh, E cạnh\n• Bộ nhớ: O(V) cho queue và mảng visited"
            }
        ]
    },
    {
        id: "dfs",
        title: "Depth-First Search (DFS)",
        topic: "graph",
        difficulty: "Easy",
        duration: "15 phút",
        summary: "Duyệt đồ thị đi sâu nhất có thể trước khi quay lui.",
        relatedProblemId: "2",
        roadmapId: "graph",
        sections: [
            {
                title: "DFS là gì?",
                content: "Depth-First Search đi theo một nhánh đến khi không đi tiếp được, rồi quay lui (backtrack) thử nhánh khác. Có thể cài bằng đệ quy hoặc stack."
            },
            {
                title: "Ứng dụng",
                content: "• Đếm thành phần liên thông\n• Phát hiện chu trình\n• Topological Sort\n• Tìm cầu (bridge), điểm khớp (articulation point)"
            },
            {
                title: "Code mẫu (C++)",
                code: `void dfs(int u) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v);
    }
}`
            },
            {
                title: "BFS vs DFS",
                content: "BFS tìm đường ngắn nhất (không trọng số). DFS tiết kiệm bộ nhớ hơn trong một số bài và phù hợp khi cần đi sâu/backtrack."
            }
        ]
    },
    {
        id: "dijkstra",
        title: "Thuật toán Dijkstra",
        topic: "graph",
        difficulty: "Medium",
        duration: "20 phút",
        summary: "Tìm đường đi ngắn nhất trên đồ thị có trọng số không âm.",
        relatedProblemId: "3",
        roadmapId: "graph",
        sections: [
            {
                title: "Ý tưởng",
                content: "Luôn chọn đỉnh chưa xử lý có khoảng cách nhỏ nhất từ nguồn (greedy). Dùng priority queue (min-heap) để lấy đỉnh này nhanh."
            },
            {
                title: "Các bước",
                content: "1. Khởi tạo dist[source] = 0, các đỉnh khác = ∞\n2. Push (0, source) vào priority queue\n3. Lấy đỉnh u có dist nhỏ nhất → relax các cạnh (u, v, w): dist[v] = min(dist[v], dist[u] + w)\n4. Lặp đến khi queue rỗng"
            },
            {
                title: "Code mẫu",
                code: `priority_queue<pair<int,int>, vector<...>, greater<...>> pq;
dist[s] = 0; pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;
    for (auto [v, w] : adj[u])
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
}`
            },
            {
                title: "Lưu ý",
                content: "Không áp dụng khi cạnh có trọng số âm. Với trọng số âm dùng Bellman-Ford hoặc SPFA."
            }
        ]
    },
    {
        id: "topo-sort",
        title: "Topological Sort",
        topic: "graph",
        difficulty: "Medium",
        duration: "18 phút",
        summary: "Sắp xếp đỉnh DAG sao cho mọi cạnh u→v có u đứng trước v.",
        relatedProblemId: "4",
        roadmapId: "graph",
        sections: [
            {
                title: "Điều kiện",
                content: "Chỉ tồn tại trên DAG (Directed Acyclic Graph) — đồ thị có hướng không chu trình. Nếu có chu trình thì không topo sort được."
            },
            {
                title: "Cách Kahn (BFS)",
                content: "1. Tính in-degree mỗi đỉnh\n2. Cho các đỉnh in-degree = 0 vào queue\n3. Lấy u ra, thêm vào kết quả, giảm in-degree của hàng xóm\n4. Nếu hàng xóm còn in-degree 0 → vào queue"
            },
            {
                title: "Cách DFS",
                content: "DFS xong thì push đỉnh vào stack. Thứ tự pop stack là topo sort ngược. Cần phát hiện chu trình (màu xám/đen)."
            }
        ]
    },
    {
        id: "dp-intro",
        title: "Tư duy Dynamic Programming",
        topic: "dp",
        difficulty: "Easy",
        duration: "20 phút",
        summary: "Chia bài toán lớn thành bài con chồng lên nhau và lưu kết quả.",
        relatedProblemId: "5",
        roadmapId: "dp",
        sections: [
            {
                title: "DP là gì?",
                content: "Dynamic Programming giải bài toán tối ưu bằng cách chia thành các bài con nhỏ hơn, lưu kết quả (memoization/tabulation) để không tính lại."
            },
            {
                title: "Hai điều kiện",
                content: "1. Optimal substructure — nghiệm tối ưu chứa nghiệm tối ưu của bài con\n2. Overlapping subproblems — các bài con bị lặp lại nhiều lần"
            },
            {
                title: "Quy trình làm bài DP",
                content: "1. Xác định trạng thái dp[i] hoặc dp[i][j]\n2. Viết công thức chuyển tiếp (transition)\n3. Xác định base case\n4. Thứ tự duyệt (bottom-up) hoặc đệ quy + memo (top-down)"
            }
        ]
    },
    {
        id: "knapsack",
        title: "Bài toán 0/1 Knapsack",
        topic: "dp",
        difficulty: "Easy",
        duration: "18 phút",
        summary: "Chọn vật tối đa giá trị với giới hạn trọng lượng, mỗi vật chọn tối đa 1 lần.",
        relatedProblemId: "5",
        roadmapId: "dp",
        sections: [
            {
                title: "Trạng thái",
                content: "dp[w] = giá trị lớn nhất đạt được với trọng lượng tối đa w."
            },
            {
                title: "Transition",
                content: "Với mỗi vật i: duyệt w từ W xuống weight[i]:\ndp[w] = max(dp[w], dp[w - weight[i]] + value[i])\n\nDuyệt ngược w để mỗi vật chỉ dùng một lần."
            },
            {
                title: "Code mẫu",
                code: `for (int i = 0; i < n; i++)
    for (int w = W; w >= weight[i]; w--)
        dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);`
            }
        ]
    },
    {
        id: "lis",
        title: "Longest Increasing Subsequence",
        topic: "dp",
        difficulty: "Medium",
        duration: "20 phút",
        summary: "Tìm độ dài dãy con tăng dài nhất.",
        relatedProblemId: "6",
        roadmapId: "dp",
        sections: [
            {
                title: "DP O(n²)",
                content: "dp[i] = độ dài LIS kết thúc tại i.\ndp[i] = 1 + max(dp[j]) với j < i và a[j] < a[i].\nĐáp án = max(dp[i])."
            },
            {
                title: "Tối ưu O(n log n)",
                content: "Giữ mảng tails[] — tails[k] là phần tử cuối nhỏ nhất của dãy con tăng độ dài k+1. Với mỗi a[i], dùng binary search vị trí thay thế."
            }
        ]
    },
    {
        id: "coin-change",
        title: "Coin Change",
        topic: "dp",
        difficulty: "Medium",
        duration: "15 phút",
        summary: "Tối thiểu số đồng xu để đổi đúng một số tiền.",
        relatedProblemId: "7",
        roadmapId: "dp",
        sections: [
            {
                title: "Trạng thái",
                content: "dp[x] = số đồng xu ít nhất để đổi đúng số tiền x."
            },
            {
                title: "Transition",
                content: "dp[0] = 0, dp[x] = ∞ ban đầu.\nVới mỗi coin: dp[x] = min(dp[x], dp[x - coin] + 1)."
            },
            {
                title: "Biến thể",
                content: "Đếm số cách đổi tiền: dp[x] += dp[x - coin] thay vì min."
            }
        ]
    },
    {
        id: "tree-traversal",
        title: "Duyệt cây nhị phân",
        topic: "tree",
        difficulty: "Easy",
        duration: "18 phút",
        summary: "Preorder, inorder, postorder và tính độ sâu cây.",
        relatedProblemId: "8",
        roadmapId: "tree",
        sections: [
            {
                title: "Ba cách duyệt",
                content: "• Preorder: root → trái → phải\n• Inorder: trái → root → phải (BST cho kết quả tăng dần)\n• Postorder: trái → phải → root"
            },
            {
                title: "Độ sâu cây",
                content: "depth(node) = 0 nếu null\ndepth(node) = 1 + max(depth(left), depth(right))"
            },
            {
                title: "Code mẫu",
                code: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left),
                   maxDepth(root->right));
}`
            }
        ]
    },
    {
        id: "lca",
        title: "Lowest Common Ancestor (LCA)",
        topic: "tree",
        difficulty: "Medium",
        duration: "22 phút",
        summary: "Tìm tổ tiên chung gần nhất của hai nút trong cây.",
        relatedProblemId: "9",
        roadmapId: "tree",
        sections: [
            {
                title: "Định nghĩa",
                content: "LCA của p và q là nút sâu nhất vừa là tổ tiên của cả p và q."
            },
            {
                title: "DFS đơn giản",
                content: "Nếu nút hiện tại là p hoặc q → trả về nó.\nDFS trái và phải. Nếu cả hai nhánh trả về khác null → nút hiện tại là LCA.\nNgược lại trả về nhánh không null."
            },
            {
                title: "Nâng cao",
                content: "Binary Lifting hoặc Euler Tour + RMQ cho nhiều truy vấn O(log n) hoặc O(1)."
            }
        ]
    },
    {
        id: "tree-diameter",
        title: "Đường kính cây nhị phân",
        topic: "tree",
        difficulty: "Medium",
        duration: "18 phút",
        summary: "Tìm đường đi dài nhất giữa hai nút trong cây.",
        relatedProblemId: "10",
        roadmapId: "tree",
        sections: [
            {
                title: "Ý tưởng",
                content: "Đường kính đi qua một nút = 1 + hai nhánh con sâu nhất (top 2 depths). Duyệt cây, cập nhật đường kính toàn cục."
            },
            {
                title: "Cách làm",
                content: "Hàm dfs(u) trả về độ sâu max từ u xuống lá.\nKhi có leftDepth và rightDepth: diameter = max(diameter, leftDepth + rightDepth)."
            }
        ]
    }
];

export const TOPIC_LABELS = {
    graph: "Graph",
    dp: "Dynamic Programming",
    tree: "Tree"
};

export function getLessonById(id) {
    return LESSONS.find((l) => l.id === id) || null;
}

export function getLessonsByTopic(topic) {
    if (!topic || topic === "all") return [...LESSONS];
    return LESSONS.filter((l) => l.topic === topic);
}
