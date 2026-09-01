<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\LookbookEntry;
use Illuminate\Http\Request;

class AdminLookbookController extends Controller {
    public function index() {
        $entries = LookbookEntry::with('product')->orderBy('sort_order')->get();
        $products = CatalogProduct::published()->get();
        return view('admin.lookbook.index', compact('entries', 'products'));
    }

    public function store(Request $request) {
        $data = $request->validate([
            'title' => 'required|string|max:160',
            'title_arabic' => 'required|string|max:160',
            'description' => 'nullable|string|max:2000',
            'image_url' => 'required|string|max:2000',
            'product_id' => 'nullable|exists:catalog_products,id',
            'sort_order' => 'integer',
            'published' => 'boolean',
        ]);

        LookbookEntry::create($data);
        return back()->with('success', 'تمت إضافة تنسيق اللوك بوك بنجاح!');
    }

    public function update(Request $request, int $id) {
        $entry = LookbookEntry::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string|max:160',
            'title_arabic' => 'required|string|max:160',
            'description' => 'nullable|string|max:2000',
            'image_url' => 'required|string|max:2000',
            'product_id' => 'nullable|exists:catalog_products,id',
            'sort_order' => 'integer',
            'published' => 'boolean',
        ]);

        $entry->update($data);
        return back()->with('success', 'تم تحديث التنسيق بنجاح!');
    }

    public function destroy(int $id) {
        LookbookEntry::findOrFail($id)->delete();
        return back()->with('success', 'تم حذف التنسيق.');
    }
}
