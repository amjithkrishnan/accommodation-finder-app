package com.example.serviceapp.util;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class ImageThumbnailUtil {
    private static final int THUMBNAIL_WIDTH = 300;
    private static final int THUMBNAIL_HEIGHT = 300;

    public static byte[] generateThumbnail(byte[] originalImage) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(originalImage);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            BufferedImage original = ImageIO.read(bais);

            if (original == null) {
                throw new IOException("Unable to read image");
            }

            int width = original.getWidth();
            int height = original.getHeight();

            double aspectRatio = (double) width / height;
            int thumbnailWidth = THUMBNAIL_WIDTH;
            int thumbnailHeight = THUMBNAIL_HEIGHT;

            if (aspectRatio > 1) {
                thumbnailHeight = (int) (THUMBNAIL_WIDTH / aspectRatio);
            } else {
                thumbnailWidth = (int) (THUMBNAIL_HEIGHT * aspectRatio);
            }

            BufferedImage thumbnail = new BufferedImage(thumbnailWidth, thumbnailHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = thumbnail.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(original, 0, 0, thumbnailWidth, thumbnailHeight, null);
            g.dispose();

            ImageIO.write(thumbnail, "jpg", baos);
            return baos.toByteArray();
        }
    }
}
