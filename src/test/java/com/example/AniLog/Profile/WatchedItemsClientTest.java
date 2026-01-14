package com.example.AniLog.Profile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class WatchedItemsClientTest {

    @Mock
    private WatchedItemsService watchedItemsService;

    @InjectMocks
    private WatchedItemsClient watchedItemsClient;

    private WatchedItem testWatchedItem;
    private List<WatchedItem> testWatchedList;
    private WatchedItemsClient.ProgressUpdate progressUpdate;

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

        WatchedItem testWatchedItem2 = new WatchedItem();
        testWatchedItem2.setId(2L);
        testWatchedItem2.setUserId(1L);
        testWatchedItem2.setTitle("Attack on Titan");
        testWatchedItem2.setType(WatchedItem.MediaType.ANIME);
        testWatchedItem2.setAnilistId(16498);
        testWatchedItem2.setStatus(WatchedItem.WatchStatus.COMPLETED);

        testWatchedList = Arrays.asList(testWatchedItem, testWatchedItem2);

        progressUpdate = new WatchedItemsClient.ProgressUpdate();
        progressUpdate.setProgress(12);
    }

    // GET All Watched Items Tests
    @Test
    void testGetAllWatchedItemsSuccess() {
        when(watchedItemsService.getAllWatchedItems(1L)).thenReturn(testWatchedList);

        ResponseEntity<?> response = watchedItemsClient.getAllWatchedItems(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testWatchedList, response.getBody());
        verify(watchedItemsService, times(1)).getAllWatchedItems(1L);
    }

    @Test
    void testGetAllWatchedItemsNullUserId() {
        ResponseEntity<?> response = watchedItemsClient.getAllWatchedItems(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertNotNull(error);
        assertEquals("User ID is required", error.getError());
    }

    @Test
    void testGetAllWatchedItemsEmptyList() {
        when(watchedItemsService.getAllWatchedItems(2L)).thenReturn(Arrays.asList());

        ResponseEntity<?> response = watchedItemsClient.getAllWatchedItems(2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Arrays.asList(), response.getBody());
    }

    // GET Watched Items by Type Tests
    @Test
    void testGetWatchedItemsByTypeAnimeSuccess() {
        when(watchedItemsService.getWatchedItemsByType(1L, "ANIME"))
            .thenReturn(testWatchedList);

        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByType(1L, "ANIME");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testWatchedList, response.getBody());
        verify(watchedItemsService, times(1)).getWatchedItemsByType(1L, "ANIME");
    }

    @Test
    void testGetWatchedItemsByTypeMangaSuccess() {
        List<WatchedItem> mangaList = Arrays.asList();
        when(watchedItemsService.getWatchedItemsByType(1L, "MANGA"))
            .thenReturn(mangaList);

        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByType(1L, "MANGA");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mangaList, response.getBody());
    }

    @Test
    void testGetWatchedItemsByTypeNullUserId() {
        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByType(null, "ANIME");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testGetWatchedItemsByTypeNullType() {
        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByType(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testGetWatchedItemsByTypeInvalidType() {
        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByType(1L, "INVALID");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertNotNull(error);
        assertEquals("Type must be either 'ANIME' or 'MANGA'", error.getError());
    }

    // GET Watched Items by Status Tests
    @Test
    void testGetWatchedItemsByStatusSuccess() {
        when(watchedItemsService.getWatchedItemsByStatus(1L, "WATCHING"))
            .thenReturn(testWatchedList);

        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByStatus(1L, "WATCHING");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testWatchedList, response.getBody());
        verify(watchedItemsService, times(1)).getWatchedItemsByStatus(1L, "WATCHING");
    }

    @Test
    void testGetWatchedItemsByStatusNullUserId() {
        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByStatus(null, "COMPLETED");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testGetWatchedItemsByStatusNullStatus() {
        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByStatus(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    // GET Watched Items by Type and Status Tests
    @Test
    void testGetWatchedItemsByTypeAndStatusSuccess() {
        when(watchedItemsService.getWatchedItemsByTypeAndStatus(1L, "ANIME", "COMPLETED"))
            .thenReturn(testWatchedList);

        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByTypeAndStatus(1L, "ANIME", "COMPLETED");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testWatchedList, response.getBody());
        verify(watchedItemsService, times(1)).getWatchedItemsByTypeAndStatus(1L, "ANIME", "COMPLETED");
    }

    @Test
    void testGetWatchedItemsByTypeAndStatusInvalidType() {
        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByTypeAndStatus(1L, "INVALID", "WATCHING");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testGetWatchedItemsByTypeAndStatusNullParams() {
        ResponseEntity<?> response = watchedItemsClient.getWatchedItemsByTypeAndStatus(null, "ANIME", "WATCHING");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    // POST Tests - Add Watched Item
    @Test
    void testAddWatchedItemSuccess() throws Exception {
        when(watchedItemsService.addWatchedItem(testWatchedItem)).thenReturn(testWatchedItem);

        ResponseEntity<?> response = watchedItemsClient.addWatchedItem(testWatchedItem);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testWatchedItem, response.getBody());
        verify(watchedItemsService, times(1)).addWatchedItem(testWatchedItem);
    }

    @Test
    void testAddWatchedItemNullItem() throws Exception {
        ResponseEntity<?> response = watchedItemsClient.addWatchedItem(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testAddWatchedItemNullUserId() {
        testWatchedItem.setUserId(null);

        ResponseEntity<?> response = watchedItemsClient.addWatchedItem(testWatchedItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testAddWatchedItemNullTitle() {
        testWatchedItem.setTitle(null);

        ResponseEntity<?> response = watchedItemsClient.addWatchedItem(testWatchedItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testAddWatchedItemDuplicateError() throws Exception {
        when(watchedItemsService.addWatchedItem(testWatchedItem))
            .thenThrow(new Exception("Item already exists in watched list"));

        ResponseEntity<?> response = watchedItemsClient.addWatchedItem(testWatchedItem);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    // PUT Tests - Update Watched Item
    @Test
    void testUpdateWatchedItemSuccess() throws Exception {
        when(watchedItemsService.updateWatchedItem(1L, testWatchedItem)).thenReturn(testWatchedItem);

        ResponseEntity<?> response = watchedItemsClient.updateWatchedItem(1L, testWatchedItem);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testWatchedItem, response.getBody());
        verify(watchedItemsService, times(1)).updateWatchedItem(1L, testWatchedItem);
    }

    @Test
    void testUpdateWatchedItemNullItemId() {
        ResponseEntity<?> response = watchedItemsClient.updateWatchedItem(null, testWatchedItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testUpdateWatchedItemNullItem() {
        ResponseEntity<?> response = watchedItemsClient.updateWatchedItem(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testUpdateWatchedItemNullUserId() {
        testWatchedItem.setUserId(null);

        ResponseEntity<?> response = watchedItemsClient.updateWatchedItem(1L, testWatchedItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    // PATCH Tests - Update Progress
    @Test
    void testUpdateProgressSuccess() throws Exception {
        when(watchedItemsService.updateProgress(1L, 38000, 12))
            .thenReturn(testWatchedItem);

        ResponseEntity<?> response = watchedItemsClient.updateProgress(1L, 38000, progressUpdate);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testWatchedItem, response.getBody());
        verify(watchedItemsService, times(1)).updateProgress(1L, 38000, 12);
    }

    @Test
    void testUpdateProgressNullUserId() {
        ResponseEntity<?> response = watchedItemsClient.updateProgress(null, 38000, progressUpdate);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testUpdateProgressNullAnilistId() {
        ResponseEntity<?> response = watchedItemsClient.updateProgress(1L, null, progressUpdate);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testUpdateProgressNullProgressUpdate() {
        ResponseEntity<?> response = watchedItemsClient.updateProgress(1L, 38000, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testUpdateProgressNullProgress() {
        progressUpdate.setProgress(null);

        ResponseEntity<?> response = watchedItemsClient.updateProgress(1L, 38000, progressUpdate);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    // DELETE Tests - Remove Watched Item by Anilist ID
    @Test
    void testRemoveWatchedItemSuccess() throws Exception {
        doNothing().when(watchedItemsService).removeWatchedItem(1L, 38000);

        ResponseEntity<?> response = watchedItemsClient.removeWatchedItem(1L, 38000);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(watchedItemsService, times(1)).removeWatchedItem(1L, 38000);
    }

    @Test
    void testRemoveWatchedItemNullUserId() {
        ResponseEntity<?> response = watchedItemsClient.removeWatchedItem(null, 38000);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testRemoveWatchedItemNullAnilistId() {
        ResponseEntity<?> response = watchedItemsClient.removeWatchedItem(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testRemoveWatchedItemNotFound() throws Exception {
        doThrow(new Exception("Watched item not found"))
            .when(watchedItemsService).removeWatchedItem(1L, 99999);

        ResponseEntity<?> response = watchedItemsClient.removeWatchedItem(1L, 99999);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    // DELETE Tests - Remove Watched Item by ID
    @Test
    void testRemoveWatchedItemByIdSuccess() throws Exception {
        doNothing().when(watchedItemsService).removeWatchedItemById(1L, 1L);

        ResponseEntity<?> response = watchedItemsClient.removeWatchedItemById(1L, 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(watchedItemsService, times(1)).removeWatchedItemById(1L, 1L);
    }

    @Test
    void testRemoveWatchedItemByIdNullUserId() {
        ResponseEntity<?> response = watchedItemsClient.removeWatchedItemById(null, 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testRemoveWatchedItemByIdNullItemId() {
        ResponseEntity<?> response = watchedItemsClient.removeWatchedItemById(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }

    @Test
    void testRemoveWatchedItemByIdNotFound() throws Exception {
        doThrow(new Exception("Watched item not found"))
            .when(watchedItemsService).removeWatchedItemById(1L, 99999L);

        ResponseEntity<?> response = watchedItemsClient.removeWatchedItemById(1L, 99999L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
    }
}
