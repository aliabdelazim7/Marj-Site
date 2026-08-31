<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller {
    public function index() {
        $categories = ProductCategory::withCount('products')->get();
        return view('admin.categories.index', compact('categories'));
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => 'required|string|max:120|unique:product_categories,slug',
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,draft',
        ]);

        ProductCategory::create($data);
        return back()->with('success', 'تمت إضافة التصنيف بنجاح!');
    }

    public function update(Request $request, int $id) {
        $category = ProductCategory::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => "required|string|max:120|unique:product_categories,slug,{$id}",
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,draft',
        ]);

        $category->update($data);
        return back()->with('success', 'تم تحديث التصنيف بنجاح!');
    }

    public function destroy(int $id) {
        $category = ProductCategory::findOrFail($id);
        $category->delete();
        return back()->with('success', 'تم حذف التصنيف بنجاح.');
    }
}
