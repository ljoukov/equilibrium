<script>
    let product = 'medical disposable gloves';
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Buyer Agents</h1>
    
    <form class="max-w-md" method="post">
        <div class="mb-4">
            <label for="product" class="block text-gray-700 font-medium mb-2">Product</label>
            <input
                type="text"
                id="product"
                name="product"
                bind:value={product}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
            />
        </div>
        
        <button
            type="submit"
            class="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
            Purchase
        </button>
    </form>
</div>