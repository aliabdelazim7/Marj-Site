<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\LookbookEntry;

class LookbookController extends Controller {
    public function index() {
        $entries = LookbookEntry::where('published', true)
            ->with('product')
            ->orderBy('sort_order')
            ->get();

        return view('store.lookbook', compact('entries'));
    }
}
