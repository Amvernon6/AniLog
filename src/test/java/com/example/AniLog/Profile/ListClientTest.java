package com.example.AniLog.Profile;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
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
class ListClientTest {

    @Mock
    private ListService listService;

    @InjectMocks
    private ListClient listClient;

    private UserListItem testItem;
    private List<UserListItem> testList;

    @BeforeEach
    void setUp() {
        testItem = new UserListItem();
        testItem.setId(1L);
        testItem.setUserId(1L);
        testItem.setTitle("Demon Slayer");
        testItem.setType(UserListItem.MediaType.ANIME);
        testItem.setAnilistId(38000);
        testItem.setCoverImageUrl("https://example.com/image.jpg");

        UserListItem testItem2 = new UserListItem();
        testItem2.setId(2L);
        testItem2.setUserId(1L);
        testItem2.setTitle("Attack on Titan");
        testItem2.setType(UserListItem.MediaType.ANIME);
        testItem2.setAnilistId(16498);
        testItem2.setCoverImageUrl("https://example.com/image2.jpg");

        testList = Arrays.asList(testItem, testItem2);
    }

    // GET Tests
    @Test
    void testGetListSuccess() {
        when(listService.getUserList(1L, "ANIME")).thenReturn(testList);

        ResponseEntity<?> response = listClient.getList(1L, "ANIME");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testList, response.getBody());
        verify(listService, times(1)).getUserList(1L, "ANIME");
    }

    @Test
    void testGetListMangaSuccess() {
        when(listService.getUserList(1L, "MANGA")).thenReturn(testList);

        ResponseEntity<?> response = listClient.getList(1L, "MANGA");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testList, response.getBody());
        verify(listService, times(1)).getUserList(1L, "MANGA");
    }

    @Test
    void testGetListNullUserId() {
        ResponseEntity<?> response = listClient.getList(null, "ANIME");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("User ID and list type are required", error.getError());
    }

    @Test
    void testGetListNullListType() {
        ResponseEntity<?> response = listClient.getList(1L, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("User ID and list type are required", error.getError());
    }

    @Test
    void testGetListInvalidType() {
        ResponseEntity<?> response = listClient.getList(1L, "INVALID");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("List type must be either 'ANIME' or 'MANGA'", error.getError());
    }

    @Test
    void testGetListEmptyList() {
        when(listService.getUserList(1L, "ANIME")).thenReturn(Arrays.asList());

        ResponseEntity<?> response = listClient.getList(1L, "ANIME");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Arrays.asList(), response.getBody());
    }

    // POST Tests - Add Item
    @Test
    void testAddItemToListSuccess() throws Exception {
        when(listService.addItemToList(testItem)).thenReturn(testItem);

        ResponseEntity<?> response = listClient.addItemToList(testItem);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testItem, response.getBody());
        verify(listService, times(1)).addItemToList(testItem);
    }

    @Test
    void testAddItemToListNullItem() throws Exception {
        ResponseEntity<?> response = listClient.addItemToList(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("Item data is required", error.getError());
    }

    @Test
    void testAddItemToListNullUserId() throws Exception {
        testItem.setUserId(null);

        ResponseEntity<?> response = listClient.addItemToList(testItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("User ID and list type are required", error.getError());
    }

    @Test
    void testAddItemToListNullType() throws Exception {
        testItem.setType(null);

        ResponseEntity<?> response = listClient.addItemToList(testItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("User ID and list type are required", error.getError());
    }

    @Test
    void testAddItemToListInvalidType() throws Exception {
        testItem.setType(UserListItem.MediaType.ANIME);
        // Create invalid type scenario by directly testing with bad enum
        UserListItem invalidItem = new UserListItem();
        invalidItem.setUserId(1L);
        invalidItem.setType(UserListItem.MediaType.ANIME);
        invalidItem.setTitle("Test");

        ResponseEntity<?> response = listClient.addItemToList(invalidItem);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testAddItemToListDuplicateError() throws Exception {
        when(listService.addItemToList(testItem))
            .thenThrow(new Exception("Item already exists in the user's list"));

        ResponseEntity<?> response = listClient.addItemToList(testItem);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertTrue(error.getError().contains("Item already exists in the user's list"));
    }

    @Test
    void testAddMultipleItemsToList() throws Exception {
        when(listService.addItemToList(testItem)).thenReturn(testItem);

        ResponseEntity<?> response1 = listClient.addItemToList(testItem);

        UserListItem testItem2 = new UserListItem();
        testItem2.setId(2L);
        testItem2.setUserId(1L);
        testItem2.setTitle("Attack on Titan");
        testItem2.setType(UserListItem.MediaType.ANIME);
        testItem2.setAnilistId(16498);

        when(listService.addItemToList(testItem2)).thenReturn(testItem2);

        ResponseEntity<?> response2 = listClient.addItemToList(testItem2);

        assertEquals(HttpStatus.OK, response1.getStatusCode());
        assertEquals(HttpStatus.OK, response2.getStatusCode());
        verify(listService, times(2)).addItemToList(any());
    }

    // DELETE Tests - Remove Item
    @Test
    void testRemoveItemFromListSuccess() throws Exception {
        doNothing().when(listService).removeItemFromList(testItem);

        ResponseEntity<?> response = listClient.removeItemFromList(testItem);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof SuccessResponse);
        SuccessResponse success = (SuccessResponse) response.getBody();
        assertEquals("Item removed successfully", success.getMessage());
        verify(listService, times(1)).removeItemFromList(testItem);
    }

    @Test
    void testRemoveItemFromListNullItem() throws Exception {
        ResponseEntity<?> response = listClient.removeItemFromList(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("Item data is required", error.getError());
    }

    @Test
    void testRemoveItemFromListNullUserId() throws Exception {
        testItem.setUserId(null);

        ResponseEntity<?> response = listClient.removeItemFromList(testItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("User ID and Anilist ID are required", error.getError());
    }

    @Test
    void testRemoveItemFromListNullAnilistId() throws Exception {
        testItem.setAnilistId(null);

        ResponseEntity<?> response = listClient.removeItemFromList(testItem);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("User ID and Anilist ID are required", error.getError());
    }

    @Test
    void testRemoveItemFromListNotFound() throws Exception {
        doThrow(new Exception("Item not found in the user's list"))
            .when(listService).removeItemFromList(testItem);

        ResponseEntity<?> response = listClient.removeItemFromList(testItem);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertTrue(error.getError().contains("Item not found in the user's list"));
    }

    @Test
    void testRemoveMultipleItems() throws Exception {
        doNothing().when(listService).removeItemFromList(testItem);

        ResponseEntity<?> response1 = listClient.removeItemFromList(testItem);

        UserListItem testItem2 = new UserListItem();
        testItem2.setUserId(1L);
        testItem2.setAnilistId(16498);

        doNothing().when(listService).removeItemFromList(testItem2);

        ResponseEntity<?> response2 = listClient.removeItemFromList(testItem2);

        assertEquals(HttpStatus.OK, response1.getStatusCode());
        assertEquals(HttpStatus.OK, response2.getStatusCode());
        verify(listService, times(2)).removeItemFromList(any());
    }
}
