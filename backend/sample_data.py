"""
Curriculum dataset for multi-modal grounding and test assessment.
Pre-seeds rich lecture video timestamps, textbook pages, and slide decks
on Gradient Descent, Neural Network Optimization, and Backpropagation.
"""

SAMPLE_LECTURE_CHUNKS = [
    {
        "id": "lec1_00_00",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "source_type": "video",
        "page": None,
        "timestamp_str": "00:45",
        "start_seconds": 45.0,
        "end_seconds": 90.0,
        # Reliable royalty-free educational HTML5 sample video for demo player
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "text": "Welcome to CS229. Today we begin optimization fundamentals. In supervised learning, our objective is to minimize an empirical risk or loss function J of theta over our dataset of examples.",
        "citation_tag": "[CS229 Lecture 1 @ 00:45]"
    },
    {
        "id": "lec1_01_30",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "source_type": "video",
        "page": None,
        "timestamp_str": "01:30",
        "start_seconds": 90.0,
        "end_seconds": 150.0,
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "text": "The gradient vector nabla J(theta) points in the direction of greatest rate of increase of the loss. Consequently, to minimize loss, we take steps in the opposite direction: theta equals theta minus alpha times nabla J(theta).",
        "citation_tag": "[CS229 Lecture 1 @ 01:30]"
    },
    {
        "id": "lec1_02_45",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "source_type": "video",
        "page": None,
        "timestamp_str": "02:45",
        "start_seconds": 165.0,
        "end_seconds": 230.0,
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "text": "Let us examine the learning rate alpha. If alpha is chosen too small, gradient descent will be excruciatingly slow, requiring millions of epochs to reach the bowl of the loss surface.",
        "citation_tag": "[CS229 Lecture 1 @ 02:45]"
    },
    {
        "id": "lec1_04_15",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "source_type": "video",
        "page": None,
        "timestamp_str": "04:15",
        "start_seconds": 255.0,
        "end_seconds": 320.0,
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "text": "Conversely, if alpha is set too large, gradient descent can overshoot the global minimum, bounce across ravine walls, and catastrophically diverge towards numerical infinity.",
        "citation_tag": "[CS229 Lecture 1 @ 04:15]"
    },
    {
        "id": "lec1_05_50",
        "source_name": "CS229 Lecture 1 - Optimization Fundamentals",
        "source_type": "video",
        "page": None,
        "timestamp_str": "05:50",
        "start_seconds": 350.0,
        "end_seconds": 415.0,
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "text": "To address oscillations in ill-conditioned ravines, we introduce the Momentum optimizer. Momentum accumulates an exponential moving average of past gradients, dampening perpendicular oscillations while accelerating along the consistent downhill trajectory.",
        "citation_tag": "[CS229 Lecture 1 @ 05:50]"
    },
    # Textbook Chunks
    {
        "id": "dl_book_p14",
        "source_name": "Deep Learning Textbook (Goodfellow)",
        "source_type": "pdf",
        "page": 14,
        "timestamp_str": None,
        "start_seconds": None,
        "end_seconds": None,
        "video_url": None,
        "text": "Chapter 4: Numerical Computation. Most deep learning algorithms involve continuous optimization. Gradient descent is an iterative first-order optimization algorithm for finding a local minimum of a differentiable function. The step size is governed by hyperparameter alpha, commonly designated the learning rate.",
        "citation_tag": "[Deep Learning Textbook p. 14]"
    },
    {
        "id": "dl_book_p28",
        "source_name": "Deep Learning Textbook (Goodfellow)",
        "source_type": "pdf",
        "page": 28,
        "timestamp_str": None,
        "start_seconds": None,
        "end_seconds": None,
        "video_url": None,
        "text": "Chapter 6: Deep Feedforward Networks and Backpropagation. Backpropagation applies the multivariable calculus chain rule backward from the output layer to calculate partial derivatives of the scalar loss with respect to all internal weight tensors W and bias vectors b.",
        "citation_tag": "[Deep Learning Textbook p. 28]"
    },
    {
        "id": "dl_book_p45",
        "source_name": "Deep Learning Textbook (Goodfellow)",
        "source_type": "pdf",
        "page": 45,
        "timestamp_str": None,
        "start_seconds": None,
        "end_seconds": None,
        "video_url": None,
        "text": "Chapter 8: Optimization for Training Deep Models. In Stochastic Gradient Descent (SGD), instead of computing the true expectation of the gradient over the entire training set of size N, we compute an unbiased Monte Carlo estimate using a mini-batch of size m (typically 32 to 256).",
        "citation_tag": "[Deep Learning Textbook p. 45]"
    },
    # Slide Deck Chunks
    {
        "id": "slides_w3_s02",
        "source_name": "Week 3 Slides - Neural Optimization",
        "source_type": "slides",
        "page": 2,
        "slide_number": 2,
        "timestamp_str": None,
        "start_seconds": None,
        "end_seconds": None,
        "video_url": None,
        "text": "Slide 2: The Optimization Landscape. Loss surfaces in deep networks are non-convex, characterized by vast plateaus, saddle points with high condition numbers, and ravines. Saddle points are far more prevalent than true local minima in high-dimensional parameter spaces.",
        "citation_tag": "[Week 3 Slides Slide 2]"
    },
    {
        "id": "slides_w3_s05",
        "source_name": "Week 3 Slides - Neural Optimization",
        "source_type": "slides",
        "page": 5,
        "slide_number": 5,
        "timestamp_str": None,
        "start_seconds": None,
        "end_seconds": None,
        "video_url": None,
        "text": "Slide 5: Adaptive Learning Rate Algorithms: Adam (Adaptive Moment Estimation). Adam combines the advantages of Momentum (first moment estimate) and RMSProp (uncentered second moment estimate) with bias-correction terms to handle sparse gradients naturally.",
        "citation_tag": "[Week 3 Slides Slide 5]"
    }
]

def seed_sample_curriculum(vector_store):
    """Seed the vector store with curriculum chunks if not already populated."""
    if len(vector_store.documents) == 0:
        print("[SampleData] Pre-seeding vector store with multimodal curriculum chunks...")
        vector_store.add_documents(SAMPLE_LECTURE_CHUNKS)
        print("[SampleData] Successfully seeded sample curriculum!")
