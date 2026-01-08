<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('video_type'); // 'magnet' or 'url'
            $table->text('video_identifier'); // magnet link or URL
            $table->string('video_identifier_hash', 64); // SHA-256 hash for uniqueness
            $table->string('title')->nullable();
            $table->text('thumbnail_url')->nullable();
            $table->json('metadata')->nullable(); // Additional video metadata
            $table->timestamps();
            
            // Prevent duplicate favorites using hash
            $table->unique(['user_id', 'video_identifier_hash']);
            $table->index('video_identifier_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
