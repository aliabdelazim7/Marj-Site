<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class AdminReviewController extends Controller {
    public function index() {
        $reviews = ProductReview::with(['order', 'product'])->latest()->paginate(20);
        return view('admin.reviews.index', compact('reviews'));
    }

    public function updateStatus(Request $request, int $id) {
        $request->validate(['status' => 'required|in:pending,approved,rejected']);
        $review = ProductReview::findOrFail($id);
        $review->update(['status' => $request->status]);

        return back()->with('success', 'تم تحديث حالة التقييم بنجاح.');
    }

    public function destroy(int $id) {
        ProductReview::findOrFail($id)->delete();
        return back()->with('success', 'تم حذف التقييم.');
    }
}
