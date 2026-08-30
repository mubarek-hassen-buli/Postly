import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Image as ImageIcon, Video, X } from 'lucide-react-native';
import { mediaService, UploadedMediaItem } from '../../services/media/mediaService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface LocalMediaAttachment {
  id?: string;
  localUri: string;
  media_url?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  file_size?: number;
  isUploading?: boolean;
}

export interface MediaPickerSectionProps {
  attachments: LocalMediaAttachment[];
  onAttachmentsChange: (attachments: LocalMediaAttachment[]) => void;
  maxCount?: number;
}

export const MediaPickerSection: React.FC<MediaPickerSectionProps> = ({
  attachments,
  onAttachmentsChange,
  maxCount = 10,
}) => {
  const handlePickImages = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const remainingSlots = maxCount - attachments.length;
    if (remainingSlots <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.85,
    });

    if (result.canceled || !result.assets) return;

    for (const asset of result.assets) {
      const fileName = asset.fileName || `image_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const newAttachment: LocalMediaAttachment = {
        id: tempId,
        localUri: asset.uri,
        media_type: 'IMAGE',
        file_size: asset.fileSize,
        isUploading: true,
      };

      // Append temporary loading thumbnail
      onAttachmentsChange([...attachments, newAttachment]);

      // Trigger upload
      try {
        const uploaded: UploadedMediaItem = await mediaService.uploadMediaDirect(
          asset.uri,
          fileName,
          mimeType
        );

        onAttachmentsChange([
          ...attachments.filter((a) => a.id !== tempId),
          {
            id: uploaded.id,
            localUri: asset.uri,
            media_url: uploaded.media_url,
            media_type: 'IMAGE',
            file_size: uploaded.file_size,
            isUploading: false,
          },
        ]);
      } catch (error) {
        console.warn('Failed to upload image:', error);
        onAttachmentsChange(attachments.filter((a) => a.id !== tempId));
      }
    }
  };

  const handlePickVideo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    if (attachments.length >= maxCount) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName || `video_${Date.now()}.mp4`;
    const mimeType = asset.mimeType || 'video/mp4';

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const newAttachment: LocalMediaAttachment = {
      id: tempId,
      localUri: asset.uri,
      media_type: 'VIDEO',
      file_size: asset.fileSize,
      isUploading: true,
    };

    onAttachmentsChange([...attachments, newAttachment]);

    try {
      const uploaded: UploadedMediaItem = await mediaService.uploadMediaDirect(
        asset.uri,
        fileName,
        mimeType
      );

      onAttachmentsChange([
        ...attachments.filter((a) => a.id !== tempId),
        {
          id: uploaded.id,
          localUri: asset.uri,
          media_url: uploaded.media_url,
          media_type: 'VIDEO',
          file_size: uploaded.file_size,
          isUploading: false,
        },
      ]);
    } catch (error) {
      console.warn('Failed to upload video:', error);
      onAttachmentsChange(attachments.filter((a) => a.id !== tempId));
    }
  };

  const handleRemove = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const updated = [...attachments];
    updated.splice(index, 1);
    onAttachmentsChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          Media Attachments ({attachments.length}/{maxCount})
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {/* Add Image Button */}
        {attachments.length < maxCount && (
          <TouchableOpacity
            onPress={handlePickImages}
            style={styles.addMediaBtn}
            accessibilityLabel="Add Photo"
          >
            <ImageIcon size={20} color={colors.primary.DEFAULT} />
            <Text style={styles.addMediaText}>+ Photo</Text>
          </TouchableOpacity>
        )}

        {/* Add Video Button */}
        {attachments.length < maxCount && (
          <TouchableOpacity
            onPress={handlePickVideo}
            style={styles.addMediaBtn}
            accessibilityLabel="Add Video"
          >
            <Video size={20} color={colors.primary.DEFAULT} />
            <Text style={styles.addMediaText}>+ Video</Text>
          </TouchableOpacity>
        )}

        {/* Thumbnails */}
        {attachments.map((item, index) => (
          <View key={item.id || index} style={styles.thumbnailContainer}>
            <Image source={{ uri: item.localUri }} style={styles.thumbnail} />

            {item.isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}

            {!item.isUploading && (
              <TouchableOpacity
                onPress={() => handleRemove(index)}
                style={styles.removeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Remove attachment"
              >
                <X size={12} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  headerRow: {
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.presets.subheadMedium,
    color: colors.text.secondary,
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addMediaBtn: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.surface,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addMediaText: {
    ...typography.presets.caption,
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  thumbnailContainer: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.elevated,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
