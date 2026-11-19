<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_products' => Product::count(),

            'total_categories' => Category::count(),

            'total_stock' => Product::sum('quantity'),

            'stock_value' => Product::select(
                DB::raw('COALESCE(SUM(price * quantity), 0) as total')
            )->value('total'),

            'low_stock' => Product::where('quantity', '<=', 5)
                ->count(),

            'recent_products' => Product::with('category')
                ->latest()
                ->take(5)
                ->get(),

            'category_stats' => Category::withCount('products')
                ->get(['id', 'name']),
        ]);
    }
}
