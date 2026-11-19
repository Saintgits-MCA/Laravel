<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
// use App\Http\Controllers\Api\Rule;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('category')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(5);

        return response()->json($products);
    }

    // Store a new product
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Save uploaded image
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load('category'),
            'image_url' => $product->image
                ? asset('storage/' . $product->image)
                : null,
        ], 201);
    }

    // Display one product
    public function show(Product $product)
    {
        return response()->json([
            'product' => $product->load('category'),
            'image_url' => $product->image
                ? asset('storage/' . $product->image)
                : null,
        ]);
    }

    // Update product
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Replace image only when a new image is uploaded
        if ($request->hasFile('image')) {

            // Save new image first
            $newImagePath = $request->file('image')->store('products', 'public');

            // Delete previous image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $validated['image'] = $newImagePath;
        }

        // Without a new upload, the existing image is preserved
        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->fresh()->load('category'),
            'image_url' => $product->image
                ? asset('storage/' . $product->image)
                : null,
        ]);
    }

    // Delete product
    public function destroy(Product $product)
    {
        // Delete associated image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
