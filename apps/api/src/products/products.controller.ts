import { Controller, Get, Post, Body, Delete, Param, Patch, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.productsService.findAll(
            Number(page), 
            Number(limit), 
            search, 
            categoryId, 
            isActive === 'true' ? true : (isActive === 'false' ? false : undefined)
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const product = await this.productsService.findOne(id);
        if (!product) throw new Error('Product not found');
        return product;
    }

    @Post()
    async create(
        @Body()
        data: {
            name: string;
            description?: string;
            price: number;
            purchasePrice?: number;
            stock: number;
            imageUrl?: string;
            categoryId?: string;
        },
    ) {
        return this.productsService.create({
            ...data,
            price: Number(data.price),
            purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : 0,
            stock: Number(data.stock),
        });
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body()
        data: {
            name?: string;
            description?: string;
            price?: number;
            purchasePrice?: number;
            stock?: number;
            imageUrl?: string;
            categoryId?: string;
            isActive?: boolean;
        },
    ) {
        return this.productsService.update(id, {
            ...data,
            price: data.price ? Number(data.price) : undefined,
            purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : undefined,
            stock: data.stock ? Number(data.stock) : undefined,
        });
    }

    @Patch(':id/toggle')
    async toggleActive(@Param('id') id: string) {
        return this.productsService.toggleActive(id);
    }


    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: join(process.cwd(), 'uploads'),
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            url: `http://localhost:3005/uploads/${file.filename}`,
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.productsService.delete(id);
    }

    @Get('categories/all')
    async findAllCategories() {
        return this.productsService.findAllCategories();
    }
}

