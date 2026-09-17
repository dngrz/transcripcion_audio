package com.transcripcion.gestion.client;

import com.transcripcion.gestion.client.dto.OpenAiTranscriptionResponse;
import java.util.List;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;

public interface OpenAiTranscriptionApi {

    @Multipart
    @POST("audio/transcriptions")
    Call<OpenAiTranscriptionResponse> transcribe(
            @Header("Authorization") String authorization,
            @Part MultipartBody.Part file,
            @Part("model") RequestBody model,
            @Part("languages[]") List<RequestBody> languages,
            @Part("prompt") RequestBody prompt);
}
