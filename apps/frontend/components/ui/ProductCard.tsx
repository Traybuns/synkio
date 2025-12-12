'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Product } from '../../libs/types/product'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  vendorName?: string
  onClick?: () => void
}

export default function ProductCard({ product, vendorName, onClick }: ProductCardProps) {
  const price = parseFloat(product.price.amount)
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.price.currency || 'USD'
  }).format(price)

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-product.jpg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">{product.name.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        {vendorName && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {vendorName}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formattedPrice}
          </span>
          
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">4.8</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
