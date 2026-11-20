<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; // Import Auth

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 1. Check if Laravel knows who this is based on the Bearer token
        $user = $request->user();

        // 2. If the token failed, fallback to the first user in the DB (just for testing)
        // If this shows "Shibu", it means the token isn't being sent by Axios!
        if (!$user) {
            $user = User::first(); 
        }
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

            'user_name' => $request->user()->name,

        ]);
    }
}
