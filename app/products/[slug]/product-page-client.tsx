'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Share2, ChevronRight, ShieldCheck, FileText, TrendingUp } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { NavbarClient as Navbar } from '@/components/storefront/navbar-client';
import { AnnouncementsBar } from '@/components/storefront/announcements-bar';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-context';
import { activeTier, nextTier, type EcommProduct, type EcommReview } from '@/lib/types';

interface ProductPageClientProps {
  product: EcommProduct;
  relatedProducts: EcommProduct[];
  initialReviews: EcommReview[];
}

export function ProductPageClient({ product, relatedProducts, initialReviews }: ProductPageClientProps) {
  const { addItem } = useCart();
  const { user, isSignedIn } = useUser();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.variants.colors?.[0]?.name);
  const [selectedSize, setSelectedSize] = useState(product.variants.sizes?.[0]);
  const moq = Math.max(1, product.moq ?? 1);
  const unit = product.unit || 'piece';
  const unitLabel = (qty: number) => (qty === 1 ? unit : `${unit}s`);
  const [quantity, setQuantity] = useState(moq);
  const [addedToCart, setAddedToCart] = useState(false);

  const [reviews, setReviews] = useState<EcommReview[]>(initialReviews);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : product.rating;
  const reviewCount = reviews.length || product.reviewCount;

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.price,
      priceTiers: product.priceTiers,
      image: product.images[0] || '',
      quantity,
      stock: product.stock,
      unit,
      moq,
      stepSize: product.stepSize,
      packSize: product.packSize,
      hsnCode: product.hsnCode,
      categoryName: product.categoryName,
      selectedColor,
      selectedSize,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const currentTier = activeTier(quantity, product.priceTiers);
  const upcomingTier = nextTier(quantity, product.priceTiers);
  const effectivePrice = currentTier ? currentTier.price : product.price;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review');
      } else {
        setReviews((prev) => [data, ...prev]);
        setReviewSuccess(true);
        setReviewForm({ rating: 5, title: '', comment: '' });
      }
    } catch {
      setReviewError('Something went wrong. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementsBar />
      <Navbar />

      <div className="mx-auto max-w-[1440px] px-3 py-4 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <nav className="mb-3 flex items-center gap-1 overflow-x-auto text-[10px] text-muted-foreground sm:mb-6 sm:gap-1.5 sm:text-xs lg:mb-8 lg:text-sm">
          <Link href="/" className="shrink-0 hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/products" className="shrink-0 hover:text-primary">
            {product.categoryName || 'Products'}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-4 md:grid-cols-2 md:gap-12">
          {/* Images */}
          <div className="space-y-2 lg:space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/60 bg-secondary/20 lg:aspect-square lg:rounded-2xl lg:bg-secondary/40">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              {product.newArrival && (
                <Badge className="absolute left-4 top-4 rounded-full bg-primary text-primary-foreground hover:bg-primary">
                  New
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="absolute right-4 top-4 rounded-full bg-amber-500 text-white hover:bg-amber-500">
                  -{discount}%
                </Badge>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                      selectedImage === idx
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 lg:space-y-6">
            <div>
              {product.categoryName && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary lg:mb-3 lg:text-xs lg:tracking-[0.18em]">
                  {product.categoryName}
                </p>
              )}
              <h1 className="mb-1 font-display text-xl font-bold leading-snug tracking-tight lg:mb-2 lg:text-4xl">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 lg:h-5 lg:w-5 ${
                          i < Math.floor(avgRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/60'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium lg:text-base">
                    {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}
                  </span>
                  {reviewCount > 0 && (
                    <span className="text-xs text-muted-foreground lg:text-base">
                      ({reviewCount})
                    </span>
                  )}
                </div>
                {product.bestseller && (
                  <Badge variant="secondary">Bestseller</Badge>
                )}
              </div>
            </div>

            <div className="space-y-1 lg:space-y-2">
              <div className="flex flex-wrap items-baseline gap-2 tabular-nums lg:gap-3">
                <span className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                  <span className="ml-0.5 text-sm font-medium text-muted-foreground lg:ml-1 lg:text-base">
                    /{unit}
                  </span>
                </span>
                {currentTier && product.price > currentTier.price && (
                  <span className="text-sm text-muted-foreground line-through lg:text-xl">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
                {!currentTier && product.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through lg:text-xl">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded bg-[#256fef] px-1.5 py-0.5 text-[10px] font-bold text-white lg:hidden">
                    {discount}% OFF
                  </span>
                )}
              </div>
              {product.packSize?.label && (
                <p className="text-xs font-semibold text-muted-foreground lg:text-sm">
                  {product.packSize.label}
                </p>
              )}
              {moq > 1 && (
                <p className="text-xs font-medium text-muted-foreground lg:hidden">
                  Min order: {moq}
                </p>
              )}
              {currentTier && (
                <p className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  <TrendingUp className="h-3 w-3" />
                  {currentTier.minQty}+ {unit} tier unlocked
                </p>
              )}
              {!currentTier && upcomingTier && (
                <p className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  <TrendingUp className="h-3 w-3" />
                  Buy {upcomingTier.minQty}+ {unit} at ₹{upcomingTier.price}/{unit}
                </p>
              )}
            </div>

            {product.priceTiers && product.priceTiers.length > 0 && (
              <details className="rounded-lg border border-border/60 bg-secondary/30 lg:hidden">
                <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bulk pricing
                </summary>
                <div className="border-t border-border/40 px-3 pb-3">
                  <table className="w-full text-xs tabular-nums">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="pb-1 font-medium">Qty</th>
                        <th className="pb-1 font-medium">Price/{unit}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={!currentTier ? 'font-semibold text-emerald-700' : ''}>
                        <td className="py-1">
                          {moq}–{product.priceTiers[0].minQty - 1} {unit}
                        </td>
                        <td className="py-1">₹{product.price}</td>
                      </tr>
                      {product.priceTiers
                        .slice()
                        .sort((a, b) => a.minQty - b.minQty)
                        .map((t, i, arr) => {
                          const upper = arr[i + 1]?.minQty;
                          const isActive = currentTier?.minQty === t.minQty;
                          return (
                            <tr
                              key={t.minQty}
                              className={isActive ? 'font-semibold text-emerald-700' : ''}
                            >
                              <td className="py-1">
                                {t.minQty}{upper ? `–${upper - 1}` : '+'} {unit}
                              </td>
                              <td className="py-1">₹{t.price}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            {product.priceTiers && product.priceTiers.length > 0 && (
              <div className="hidden rounded-lg border border-border/60 bg-secondary/30 p-3 lg:block">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bulk pricing
                </p>
                <table className="mt-2 w-full text-sm tabular-nums">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-1 font-medium">Quantity</th>
                      <th className="pb-1 font-medium">Price per {unit}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={!currentTier ? 'font-semibold text-emerald-700' : ''}>
                      <td className="py-1">
                        {moq}–{product.priceTiers[0].minQty - 1} {unit}
                      </td>
                      <td className="py-1">₹{product.price}</td>
                    </tr>
                    {product.priceTiers
                      .slice()
                      .sort((a, b) => a.minQty - b.minQty)
                      .map((t, i, arr) => {
                        const upper = arr[i + 1]?.minQty;
                        const isActive = currentTier?.minQty === t.minQty;
                        return (
                          <tr
                            key={t.minQty}
                            className={isActive ? 'font-semibold text-emerald-700' : ''}
                          >
                            <td className="py-1">
                              {t.minQty}{upper ? `–${upper - 1}` : '+'} {unit}
                            </td>
                            <td className="py-1">₹{t.price}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="hidden flex-wrap items-center gap-2 text-xs text-muted-foreground lg:flex">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                <ShieldCheck className="h-3 w-3" />
                GST invoice on request
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                <FileText className="h-3 w-3" />
                Bulk pricing
              </span>
              {product.warrantyMonths && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                  {product.warrantyMonths}-month warranty
                </span>
              )}
            </div>

            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground lg:line-clamp-none lg:text-base">
              {product.description}
            </p>

            <div className="hidden space-y-4 lg:block">
              {product.variants.colors && product.variants.colors.length > 0 && (
                <div>
                  <label className="mb-3 block text-sm font-semibold">
                    Color: {selectedColor}
                  </label>
                  <div className="flex gap-3">
                    {product.variants.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${
                          selectedColor === color.name
                            ? 'border-black ring-2 ring-black ring-offset-2'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.variants.sizes && product.variants.sizes.length > 0 && (
                <div>
                  <label className="mb-3 block text-sm font-semibold">Size</label>
                  <div className="flex gap-2">
                    {product.variants.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-lg border-2 px-6 py-2 text-sm font-medium transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-3 block text-sm font-semibold">
                  Quantity {unit !== 'piece' && <span className="text-muted-foreground font-normal">({unitLabel(quantity)})</span>}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(moq, quantity - 1))}
                    disabled={quantity <= moq}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  >
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} ${unitLabel(product.stock)} available` : 'Out of stock'}
                  </span>
                </div>
                {moq > 1 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Min. order: {moq} {unitLabel(moq)}
                  </p>
                )}
              </div>
            </div>

            <div className="hidden gap-3 lg:flex">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {addedToCart
                  ? 'Added to basket'
                  : product.stock === 0
                  ? 'Out of stock'
                  : 'Add to basket'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={async () => {
                  if (!isSignedIn) {
                    toast('Sign in to save items to your lists');
                    return;
                  }
                  try {
                    const listsRes = await fetch('/api/saved-lists');
                    const lists = await listsRes.json();
                    let listId: string;
                    if (lists.length > 0) {
                      listId = lists[0].id;
                    } else {
                      const createRes = await fetch('/api/saved-lists', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'My Wishlist' }),
                      });
                      const newList = await createRes.json();
                      listId = newList.id;
                    }
                    await fetch(`/api/saved-lists/${listId}/items`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        productId: product.id,
                        productName: product.name,
                        slug: product.slug,
                        image: product.images[0] || '',
                        unit: product.unit,
                        qty: product.moq || 1,
                        price: product.price,
                      }),
                    });
                    toast.success('Added to your saved list');
                  } catch {
                    toast.error('Could not save item');
                  }
                }}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    await navigator.share({ title: product.name, url });
                  } else {
                    await navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard');
                  }
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden space-y-2 border-t pt-6 lg:block">
              {product.sku && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Availability:</span>
                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {product.categoryName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.categoryName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 lg:mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid h-9 w-full grid-cols-3 text-xs lg:h-10 lg:max-w-2xl lg:text-sm">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Details</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <div className="prose max-w-none">
                <h3 className="mb-4 font-display text-2xl font-bold">About this produce</h3>
                <p className="leading-relaxed text-muted-foreground">{product.description}</p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Sourced from verified farms, harvested at peak ripeness, and delivered within
                  24 hours to preserve freshness and flavour.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-8">
              <div className="max-w-2xl">
                <h3 className="mb-6 font-display text-2xl font-bold">Details</h3>
                {Object.keys(product.specs).length > 0 ? (
                  <dl className="divide-y">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-4">
                        <dt className="font-medium text-foreground">{key}</dt>
                        <dd className="text-muted-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-muted-foreground">No specifications available.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-8 max-w-3xl">
                <h3 className="text-2xl font-bold">Customer Reviews</h3>

                {/* Review form */}
                {isSignedIn ? (
                  <div className="rounded-lg border p-6">
                    <h4 className="mb-4 font-semibold text-lg">Write a Review</h4>
                    {reviewSuccess ? (
                      <p className="text-green-600 font-medium">
                        Thank you for your review!
                      </p>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <Label className="mb-2 block text-sm font-medium">Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                              >
                                <Star
                                  className={`h-7 w-7 transition-colors ${
                                    star <= reviewForm.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground/60 hover:text-yellow-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="review-title" className="mb-2 block text-sm font-medium">
                            Title
                          </Label>
                          <Input
                            id="review-title"
                            placeholder="Summarize your experience"
                            value={reviewForm.title}
                            onChange={(e) =>
                              setReviewForm((f) => ({ ...f, title: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="review-comment" className="mb-2 block text-sm font-medium">
                            Review
                          </Label>
                          <Textarea
                            id="review-comment"
                            placeholder="Share your experience with this product..."
                            rows={4}
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm((f) => ({ ...f, comment: e.target.value }))
                            }
                          />
                        </div>
                        {reviewError && (
                          <p className="text-sm text-red-500">{reviewError}</p>
                        )}
                        <Button type="submit" disabled={submittingReview}>
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-secondary/40 p-6 text-center">
                    <p className="text-muted-foreground mb-3">Sign in to write a review</p>
                    <Button asChild variant="outline">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </div>
                )}

                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground/60'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.verifiedPurchase && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="mb-1 font-semibold">{review.title}</h4>
                        )}
                        {review.comment && (
                          <p className="mb-2 text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-sm font-medium">{review.userName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 lg:mt-24">
            <h2 className="mb-3 font-display text-lg font-bold lg:mb-8 lg:text-3xl">
              You may also like
            </h2>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky add bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2">
          <div className="flex shrink-0 items-center rounded-lg border border-border bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-8"
              onClick={() => setQuantity(Math.max(moq, quantity - 1))}
              disabled={quantity <= moq}
            >
              -
            </Button>
            <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-8"
              onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
              disabled={product.stock > 0 && quantity >= product.stock}
            >
              +
            </Button>
          </div>
          <Button
            className="h-11 flex-1 bg-[#318616] text-base font-bold hover:bg-[#318616]/90"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {addedToCart
              ? 'Added'
              : product.stock === 0
                ? 'Out of stock'
                : `Add · ₹${(effectivePrice * quantity).toLocaleString('en-IN')}`}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
