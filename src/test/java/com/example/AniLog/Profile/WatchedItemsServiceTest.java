package com.example.AniLog.Profile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class WatchedItemsServiceTest {

    @Mock
    private WatchedItemsRepository watchedItemsRepository;

    @InjectMocks
    private WatchedItemsService watchedItemsService;

    private WatchedItem testWatchedItem;
    private List<WatchedItem> testWatchedList;

    @BeforeEach
    void setUp() {
        testWatchedItem = new WatchedItem();
        testWatchedItem.setId(1L);
        testWatchedItem.setUserId(1L);
        testWatchedItem.setTitle("Demon Slayer");
        testWatchedItem.setType(WatchedItem.MediaType.ANIME);
        testWatchedItem.setAnilistId(38000);
        testWatchedItem.setCoverImageUrl("https://example.com/image.jpg");
        testWatchedItem.setWatchedDate(LocalDateTime.now());
        testWatchedItem.setEpisodesWatched(0);
        testWatchedItem.setTotalEpisodes(26);
        testWatchedItem.setStatus(WatchedItem.WatchStatus.WATCHING);
        testWatchedItem.setRating(8);

        WatchedItem testWatchedItem2 = new WatchedItem();
        testWatchedItem2.setId(2L);
        testWatchedItem2.setUserId(1L);
        testWatchedItem2.setTitle("Attack on Titan");
        testWatchedItem2.setType(WatchedItem.MediaType.ANIME);
        testWatchedItem2.setAnilistId(16498);
        testWatchedItem2.setStatus(WatchedItem.WatchStatus.COMPLETED);

        testWatchedList = Arrays.asList(testWatchedItem, testWatchedItem2);
    }

    // GET All Watched Items Tests
    @Test
    void testGetAllWatchedItemsSuccess() {
        when(watchedItemsRepository.findByUserIdOrderByWatchedDateDesc(1L))
            .thenReturn(testWatchedList);

        List<WatchedItem> result = watchedItemsService.getAllWatchedItems(1L);

        assertEquals(2, result.size());
        assertEquals(testWatchedList, result);
        verify(watchedItemsRepository, times(1)).findByUserIdOrderByWatchedDateDesc(1L);
    }

    @Test
    void testGetAllWatchedItemsEmptyList() {
        when(watchedItemsRepository.findByUserIdOrderByWatchedDateDesc(2L))
            .thenReturn(Arrays.asList());

        List<WatchedItem> result = watchedItemsService.getAllWatchedItems(2L);

        assertTrue(result.isEmpty());
        verify(watchedItemsRepository, times(1)).findByUserIdOrderByWatchedDateDesc(2L);
    }

    // GET Watched Items by Type Tests
    @Test
    void testGetWatchedItemsByTypeAnime() {
        when(watchedItemsRepository.findByUserIdAndType(1L, WatchedItem.MediaType.ANIME))
            .thenReturn(testWatchedList);

        List<WatchedItem> result = watchedItemsService.getWatchedItemsByType(1L, "ANIME");

        assertEquals(2, result.size());
        verify(watchedItemsRepository, times(1)).findByUserIdAndType(1L, WatchedItem.MediaType.ANIME);
    }

    @Test
    void testGetWatchedItemsByTypeManga() {
        List<WatchedItem> mangaList = Arrays.asList();
        when(watchedItemsRepository.findByUserIdAndType(1L, WatchedItem.MediaType.MANGA))
            .thenReturn(mangaList);

        List<WatchedItem> result = watchedItemsService.getWatchedItemsByType(1L, "MANGA");

        assertTrue(result.isEmpty());
        verify(watchedItemsRepository, times(1)).findByUserIdAndType(1L, WatchedItem.MediaType.MANGA);
    }

    @Test
    void testGetWatchedItemsByTypeLowercaseInput() {
        when(watchedItemsRepository.findByUserIdAndType(1L, WatchedItem.MediaType.ANIME))
            .thenReturn(testWatchedList);

        List<WatchedItem> result = watchedItemsService.getWatchedItemsByType(1L, "anime");

        assertEquals(2, result.size());
    }

    // GET Watched Items by Status Tests
    @Test
    void testGetWatchedItemsByStatusWatching() {
        when(watchedItemsRepository.findByUserIdAndStatus(1L, WatchedItem.WatchStatus.WATCHING))
            .thenReturn(Arrays.asList(testWatchedItem));

        List<WatchedItem> result = watchedItemsService.getWatchedItemsByStatus(1L, "WATCHING");

        assertEquals(1, result.size());
        assertEquals(WatchedItem.WatchStatus.WATCHING, result.get(0).getStatus());
        verify(watchedItemsRepository, times(1)).findByUserIdAndStatus(1L, WatchedItem.WatchStatus.WATCHING);
    }

    @Test
    void testGetWatchedItemsByStatusCompleted() {
        List<WatchedItem> completedList = Arrays.asList();
        when(watchedItemsRepository.findByUserIdAndStatus(1L, WatchedItem.WatchStatus.COMPLETED))
            .thenReturn(completedList);

        List<WatchedItem> result = watchedItemsService.getWatchedItemsByStatus(1L, "COMPLETED");

        assertTrue(result.isEmpty());
    }

    // GET Watched Items by Type and Status Tests
    @Test
    void testGetWatchedItemsByTypeAndStatus() {
        when(watchedItemsRepository.findByUserIdAndTypeAndStatus(1L, WatchedItem.MediaType.ANIME, WatchedItem.WatchStatus.WATCHING))
            .thenReturn(Arrays.asList(testWatchedItem));

        List<WatchedItem> result = watchedItemsService.getWatchedItemsByTypeAndStatus(1L, "ANIME", "WATCHING");

        assertEquals(1, result.size());
        assertEquals(WatchedItem.MediaType.ANIME, result.get(0).getType());
        assertEquals(WatchedItem.WatchStatus.WATCHING, result.get(0).getStatus());
    }

    @Test
    void testGetWatchedItemsByTypeAndStatusMangaCompleted() {
        List<WatchedItem> result = Arrays.asList();
        when(watchedItemsRepository.findByUserIdAndTypeAndStatus(1L, WatchedItem.MediaType.MANGA, WatchedItem.WatchStatus.COMPLETED))
            .thenReturn(result);

        List<WatchedItem> returnedResult = watchedItemsService.getWatchedItemsByTypeAndStatus(1L, "MANGA", "COMPLETED");

        assertTrue(returnedResult.isEmpty());
    }

    // POST Tests - Add Watched Item
    @Test
    void testAddWatchedItemWithAnilistIdSuccess() throws Exception {
        when(watchedItemsRepository.existsByUserIdAndAnilistId(1L, 38000))
            .thenReturn(false);
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(testWatchedItem);

        WatchedItem result = watchedItemsService.addWatchedItem(testWatchedItem);

        assertNotNull(result);
        assertEquals("Demon Slayer", result.getTitle());
        verify(watchedItemsRepository, times(1)).existsByUserIdAndAnilistId(1L, 38000);
        verify(watchedItemsRepository, times(1)).save(any(WatchedItem.class));
    }

    @Test
    void testAddWatchedItemWithoutAnilistIdSuccess() throws Exception {
        WatchedItem itemWithoutAnilistId = new WatchedItem();
        itemWithoutAnilistId.setUserId(1L);
        itemWithoutAnilistId.setTitle("Demon Slayer");
        itemWithoutAnilistId.setType(WatchedItem.MediaType.ANIME);
        itemWithoutAnilistId.setAnilistId(null);

        when(watchedItemsRepository.existsByUserIdAndTitleAndType(1L, "Demon Slayer", WatchedItem.MediaType.ANIME))
            .thenReturn(false);
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(itemWithoutAnilistId);

        WatchedItem result = watchedItemsService.addWatchedItem(itemWithoutAnilistId);

        assertNotNull(result);
        assertEquals("Demon Slayer", result.getTitle());
        verify(watchedItemsRepository, times(1)).existsByUserIdAndTitleAndType(1L, "Demon Slayer", WatchedItem.MediaType.ANIME);
    }

    @Test
    void testAddWatchedItemDuplicateByAnilistId() throws Exception {
        when(watchedItemsRepository.existsByUserIdAndAnilistId(1L, 38000))
            .thenReturn(true);

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.addWatchedItem(testWatchedItem);
        });

        assertEquals("Item already exists in watched list", exception.getMessage());
        verify(watchedItemsRepository, never()).save(any());
    }

    @Test
    void testAddWatchedItemDuplicateByTitleAndType() {
        WatchedItem itemWithoutAnilistId = new WatchedItem();
        itemWithoutAnilistId.setUserId(1L);
        itemWithoutAnilistId.setTitle("Demon Slayer");
        itemWithoutAnilistId.setType(WatchedItem.MediaType.ANIME);
        itemWithoutAnilistId.setAnilistId(null);

        when(watchedItemsRepository.existsByUserIdAndTitleAndType(1L, "Demon Slayer", WatchedItem.MediaType.ANIME))
            .thenReturn(true);

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.addWatchedItem(itemWithoutAnilistId);
        });

        assertEquals("Item already exists in watched list", exception.getMessage());
        verify(watchedItemsRepository, never()).save(any());
    }

    @Test
    void testAddWatchedItemSetsDefaultWatchedDate() throws Exception {
        testWatchedItem.setWatchedDate(null);
        when(watchedItemsRepository.existsByUserIdAndAnilistId(1L, 38000))
            .thenReturn(false);
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(testWatchedItem);

        WatchedItem result = watchedItemsService.addWatchedItem(testWatchedItem);

        assertNotNull(result);
        verify(watchedItemsRepository, times(1)).save(any(WatchedItem.class));
    }

    @Test
    void testAddWatchedItemSetsDefaultStatus() throws Exception {
        testWatchedItem.setStatus(null);
        when(watchedItemsRepository.existsByUserIdAndAnilistId(1L, 38000))
            .thenReturn(false);
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(testWatchedItem);

        WatchedItem result = watchedItemsService.addWatchedItem(testWatchedItem);

        assertNotNull(result);
        verify(watchedItemsRepository, times(1)).save(any(WatchedItem.class));
    }

    // PUT Tests - Update Watched Item
    @Test
    void testUpdateWatchedItemSuccess() throws Exception {
        WatchedItem updatedItem = new WatchedItem();
        updatedItem.setUserId(1L);
        updatedItem.setStatus(WatchedItem.WatchStatus.COMPLETED);
        updatedItem.setEpisodesWatched(26);
        updatedItem.setRating(9);

        when(watchedItemsRepository.findById(1L))
            .thenReturn(Optional.of(testWatchedItem));
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(testWatchedItem);

        WatchedItem result = watchedItemsService.updateWatchedItem(1L, updatedItem);

        assertNotNull(result);
        verify(watchedItemsRepository, times(1)).findById(1L);
        verify(watchedItemsRepository, times(1)).save(any(WatchedItem.class));
    }

    @Test
    void testUpdateWatchedItemNotFound() throws Exception {
        when(watchedItemsRepository.findById(99999L))
            .thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.updateWatchedItem(99999L, testWatchedItem);
        });

        assertEquals("Watched item not found", exception.getMessage());
        verify(watchedItemsRepository, never()).save(any());
    }

    @Test
    void testUpdateWatchedItemUnauthorized() throws Exception {
        WatchedItem differentUserItem = new WatchedItem();
        differentUserItem.setUserId(2L);

        when(watchedItemsRepository.findById(1L))
            .thenReturn(Optional.of(testWatchedItem));

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.updateWatchedItem(1L, differentUserItem);
        });

        assertEquals("Unauthorized to update this item", exception.getMessage());
        verify(watchedItemsRepository, never()).save(any());
    }

    // PATCH Tests - Update Progress
    @Test
    void testUpdateProgressAnimeSuccess() throws Exception {
        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 38000))
            .thenReturn(testWatchedItem);
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(testWatchedItem);

        WatchedItem result = watchedItemsService.updateProgress(1L, 38000, 12);

        assertNotNull(result);
        verify(watchedItemsRepository, times(1)).findByUserIdAndAnilistId(1L, 38000);
        verify(watchedItemsRepository, times(1)).save(any(WatchedItem.class));
    }

    @Test
    void testUpdateProgressAnimeAutoComplete() throws Exception {
        testWatchedItem.setEpisodesWatched(25);
        testWatchedItem.setTotalEpisodes(26);
        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 38000))
            .thenReturn(testWatchedItem);
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(testWatchedItem);

        WatchedItem result = watchedItemsService.updateProgress(1L, 38000, 26);

        assertNotNull(result);
        assertEquals(26, result.getEpisodesWatched());
        verify(watchedItemsRepository, times(1)).save(any(WatchedItem.class));
    }

    @Test
    void testUpdateProgressMangaSuccess() throws Exception {
        WatchedItem mangaItem = new WatchedItem();
        mangaItem.setId(3L);
        mangaItem.setUserId(1L);
        mangaItem.setType(WatchedItem.MediaType.MANGA);
        mangaItem.setChaptersRead(0);
        mangaItem.setTotalChapters(200);

        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 12345))
            .thenReturn(mangaItem);
        when(watchedItemsRepository.save(any(WatchedItem.class)))
            .thenReturn(mangaItem);

        WatchedItem result = watchedItemsService.updateProgress(1L, 12345, 50);

        assertNotNull(result);
        verify(watchedItemsRepository, times(1)).save(any(WatchedItem.class));
    }

    @Test
    void testUpdateProgressNotFound() throws Exception {
        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 99999))
            .thenReturn(null);

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.updateProgress(1L, 99999, 10);
        });

        assertEquals("Watched item not found", exception.getMessage());
        verify(watchedItemsRepository, never()).save(any());
    }

    // DELETE Tests - Remove Watched Item by Anilist ID
    @Test
    void testRemoveWatchedItemSuccess() throws Exception {
        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 38000))
            .thenReturn(testWatchedItem);
        doNothing().when(watchedItemsRepository).delete(testWatchedItem);

        watchedItemsService.removeWatchedItem(1L, 38000);

        verify(watchedItemsRepository, times(1)).findByUserIdAndAnilistId(1L, 38000);
        verify(watchedItemsRepository, times(1)).delete(testWatchedItem);
    }

    @Test
    void testRemoveWatchedItemNotFound() throws Exception {
        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 99999))
            .thenReturn(null);

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.removeWatchedItem(1L, 99999);
        });

        assertEquals("Watched item not found", exception.getMessage());
        verify(watchedItemsRepository, never()).delete(any());
    }

    // DELETE Tests - Remove Watched Item by ID
    @Test
    void testRemoveWatchedItemByIdSuccess() throws Exception {
        when(watchedItemsRepository.findById(1L))
            .thenReturn(Optional.of(testWatchedItem));
        doNothing().when(watchedItemsRepository).delete(testWatchedItem);

        watchedItemsService.removeWatchedItemById(1L, 1L);

        verify(watchedItemsRepository, times(1)).findById(1L);
        verify(watchedItemsRepository, times(1)).delete(testWatchedItem);
    }

    @Test
    void testRemoveWatchedItemByIdNotFound() throws Exception {
        when(watchedItemsRepository.findById(99999L))
            .thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.removeWatchedItemById(1L, 99999L);
        });

        assertEquals("Watched item not found", exception.getMessage());
        verify(watchedItemsRepository, never()).delete(any());
    }

    @Test
    void testRemoveWatchedItemByIdUnauthorized() throws Exception {
        WatchedItem differentUserItem = new WatchedItem();
        differentUserItem.setId(1L);
        differentUserItem.setUserId(2L);

        when(watchedItemsRepository.findById(1L))
            .thenReturn(Optional.of(differentUserItem));

        Exception exception = assertThrows(Exception.class, () -> {
            watchedItemsService.removeWatchedItemById(1L, 1L);
        });

        assertEquals("Unauthorized to delete this item", exception.getMessage());
        verify(watchedItemsRepository, never()).delete(any());
    }

    @Test
    void testRemoveMultipleWatchedItems() throws Exception {
        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 38000))
            .thenReturn(testWatchedItem);
        doNothing().when(watchedItemsRepository).delete(testWatchedItem);

        watchedItemsService.removeWatchedItem(1L, 38000);

        WatchedItem testWatchedItem2 = new WatchedItem();
        testWatchedItem2.setId(2L);
        testWatchedItem2.setUserId(1L);
        testWatchedItem2.setAnilistId(16498);

        when(watchedItemsRepository.findByUserIdAndAnilistId(1L, 16498))
            .thenReturn(testWatchedItem2);
        doNothing().when(watchedItemsRepository).delete(testWatchedItem2);

        watchedItemsService.removeWatchedItem(1L, 16498);

        verify(watchedItemsRepository, times(2)).delete(any());
    }
}
