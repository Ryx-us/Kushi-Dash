<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CompanyInfoController extends Controller
{
    public function index()
    {
        return [
            'companyName' => env('COMPANY_NAME'), // Provide a default if not set
        ];
    }
}
